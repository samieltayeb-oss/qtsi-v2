/* ═══════════════════════════════════════════════════════════════
   QTSI — /api/lead  (serverless lead capture)

   Receives lead data from the modal forms (window.QTSI_SUBMIT) and
   the Copilot qualification flow (window.QTSI_CRM_SUBMIT), then
   forwards it to your CRM and/or an email notification — server-side,
   so no CRM keys ever touch the browser.

   Configure whichever targets you use via env vars (any combination):
     LEAD_FORWARD_URL     generic webhook (Zapier/Make/your CRM intake)
     HUBSPOT_PORTAL_ID + HUBSPOT_FORM_ID         (HubSpot Forms)
     LEAD_NOTIFY_WEBHOOK  Slack/Teams incoming webhook for notifications
     RESEND_API_KEY       email notifications via Resend (resend.com)
       LEAD_EMAIL_TO      where leads are emailed  (default info@qtsi.ca)
       LEAD_EMAIL_FROM    verified sender          (default onboarding@resend.dev)
     BOOKING_URL          if set, included in the notification email so staff
                          can see the same Calendly / MS Bookings link the lead
                          was offered.
   Nothing configured → the lead is logged and accepted (200) so the
   front-end always shows success; wire a target before go-live.

   This file routes leads only. Booking (Calendly / Microsoft Bookings) is a
   front-end action — see js/forms.js + the QTSI_BOOKING config in index.html.
═══════════════════════════════════════════════════════════════ */

const ALLOWED_ORIGINS = (process.env.QTSI_ALLOWED_ORIGINS ||
  'https://qtsi.ca,https://www.qtsi.ca,http://localhost:3000,http://localhost:5500')
  .split(',').map((s) => s.trim()).filter(Boolean);

module.exports = async function handler(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const lead = body || {};

  /* Honeypot — bots fill the hidden _gotcha field. Accept silently (200 so the
     bot sees "success") but route nothing. */
  if (lead._gotcha) {
    return res.status(200).json({ ok: true });
  }
  delete lead._gotcha;

  /* Basic validation — need at least one contact handle. */
  if (!lead.email && !lead.company && !lead.name) {
    return res.status(400).json({ error: 'lead requires at least name, email, or company' });
  }

  const enriched = {
    ...lead,
    received_at: new Date().toISOString(),
    user_agent: req.headers['user-agent'] || '',
    source: lead.source || lead.lead_source || 'QTSI Website',
  };

  const tasks = [];
  const routed = [];   // names of targets that fired (returned to the client)

  /* 1) Generic webhook (CRM intake, Zapier, Make, ERPNext, …) */
  if (process.env.LEAD_FORWARD_URL) {
    routed.push('webhook');
    tasks.push(fetch(process.env.LEAD_FORWARD_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(enriched),
    }));
  }

  /* 2) HubSpot Forms submission (no key needed for public forms) */
  if (process.env.HUBSPOT_PORTAL_ID && process.env.HUBSPOT_FORM_ID) {
    routed.push('hubspot');
    const url = `https://api.hsforms.com/submissions/v3/integration/submit/${process.env.HUBSPOT_PORTAL_ID}/${process.env.HUBSPOT_FORM_ID}`;
    tasks.push(fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        fields: Object.entries(enriched)
          .filter(([, v]) => v != null && v !== '')
          .map(([name, value]) => ({ name, value: '' + value })),
        context: { pageName: 'QTSI Website' },
      }),
    }));
  }

  /* 3) Notification webhook (Slack/Teams) so nothing is missed */
  if (process.env.LEAD_NOTIFY_WEBHOOK) {
    routed.push('slack');
    const summary = `New QTSI lead — ${enriched.name || 'Unknown'}` +
      (enriched.company ? ` @ ${enriched.company}` : '') +
      (enriched.email ? ` (${enriched.email})` : '') +
      (enriched.form_name ? ` · ${enriched.form_name}` : '');
    tasks.push(fetch(process.env.LEAD_NOTIFY_WEBHOOK, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text: summary }),
    }));
  }

  /* 4) Email notification via Resend (resend.com) — a formatted lead email to
     QTSI so a human is alerted even before the CRM sync. */
  if (process.env.RESEND_API_KEY) {
    routed.push('email');
    const to   = process.env.LEAD_EMAIL_TO   || 'info@qtsi.ca';
    const from = process.env.LEAD_EMAIL_FROM || 'QTSI Website <onboarding@resend.dev>';

    /* Subject prefix reflects urgency: high-value forms get [ACTION REQUIRED] */
    const HIGH_VALUE = ['consultation', 'proposal', 'assessment_strategy'];
    const formType   = (enriched.form_type || '').toLowerCase();
    const prefix     = HIGH_VALUE.includes(formType) ? '[ACTION REQUIRED] ' : '[QTSI] ';
    const who        = [enriched.name, enriched.company].filter(Boolean).join(' @ ') || 'Anonymous';
    const subject    = `${prefix}${enriched.form_name || 'Website lead'} — ${who}`;

    tasks.push(fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from,
        to: to.split(',').map((s) => s.trim()).filter(Boolean),
        reply_to: enriched.email || undefined,
        subject,
        html: leadEmailHtml(enriched),
      }),
    }));
  }

  try {
    if (tasks.length) await Promise.allSettled(tasks);
    else console.log('[QTSI /api/lead] (no target configured) lead:', JSON.stringify(enriched));
    return res.status(200).json({ ok: true, routed });
  } catch (e) {
    console.error('[QTSI /api/lead]', e && e.message ? e.message : e);
    /* Accept anyway — never lose the front-end success state over a
       downstream hiccup; the lead is logged for manual recovery. */
    console.log('[QTSI /api/lead] recovery log:', JSON.stringify(enriched));
    return res.status(200).json({ ok: true, routed });
  }
};

/* ── Lead notification email (HTML) ─────────────────────────────────────
   Executive-grade notification email. Layout:
     1. Dark header — logo + form type badge
     2. Gradient accent stripe (blue → green)
     3. Lead identity card (name @ company, email, phone)
     4. Message block (amber left-border, if provided)
     5. Details table (remaining submission fields)
     6. Next-action guidance (green block)
     7. Reply CTA button + footer

   All values are HTML-escaped. Uses absolute image URL for email
   client compatibility. Table-based layout for Outlook support. */
function leadEmailHtml(lead) {
  const esc = (s) => ('' + s)
    .replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const LOGO_URL = 'https://www.qtsi.ca/images/qtsi-logo.png';

  /* ── Form type → display label + accent colour ───────────── */
  const TYPE_META = {
    consultation      : { label: 'Consultation Request',  color: '#0070F3', action: 'Reply within 1 business day to confirm the consultation.' },
    proposal          : { label: 'Proposal Request',       color: '#0070F3', action: 'Review scope and reply with a proposal within 2 business days.' },
    procurement       : { label: 'Procurement Request',    color: '#5DB937', action: 'Source pricing and reply with options within 1–2 business days.' },
    book_notify       : { label: 'AI Mandate — Notify me', color: '#8B5CF6', action: 'Add to your notification list.' },
    book_download     : { label: 'AI Mandate — Download',  color: '#8B5CF6', action: 'Follow up with a governance conversation offer.' },
    assessment_strategy: { label: 'Strategy Session',     color: '#F59E0B', action: 'Reach out within 1 business day to schedule the session.' },
  };
  const ft   = (lead.form_type || '').toLowerCase();
  const meta = TYPE_META[ft] || { label: lead.form_name || 'Website Enquiry', color: '#6B7280', action: 'Review and respond as appropriate.' };

  /* ── Field label map ─────────────────────────────────────── */
  const LABELS = {
    name: 'Name', company: 'Company', email: 'Email', phone: 'Phone',
    job_title: 'Role / Title', industry: 'Industry', size: 'Company size',
    service: 'Service interest', timeline: 'Timeline', budget: 'Budget',
    it_environment: 'Current IT environment', current_provider: 'Current provider',
    product_type: 'Product type', quantity: 'Quantity',
    brand: 'Preferred brand', location: 'Delivery location', required_date: 'Required by',
    purchase_authority: 'Purchase authority',
    lead_source: 'Lead source', source: 'Source',
    received_at: 'Received at', booking_offered: 'Booking link offered',
    role: 'Role', form_name: 'Form',
  };

  const CARD_SKIP  = new Set(['form_name', 'form_type', 'message', 'consent', '_gotcha', 'user_agent', 'routed']);
  const TABLE_SKIP = new Set(['name', 'company', 'email', 'phone', 'job_title', 'industry',
    'message', 'consent', '_gotcha', 'user_agent', 'form_type']);

  /* ── Identity card rows ──────────────────────────────────── */
  const idRows = [];
  const addId = (label, val, href) => {
    if (!val) return;
    const cell = href
      ? '<a href="' + href + '" style="color:#0070F3;text-decoration:none;font-weight:500">' + esc(val) + '</a>'
      : '<span style="color:#1a1f2e;font-weight:500">' + esc(val) + '</span>';
    idRows.push(
      '<tr>' +
      '<td style="padding:5px 0;font-size:12px;color:#9ca3af;white-space:nowrap;vertical-align:top;width:100px">' + label + '</td>' +
      '<td style="padding:5px 0 5px 12px;font-size:13px;vertical-align:top">' + cell + '</td>' +
      '</tr>'
    );
  };
  addId('Email',   lead.email,     lead.email     ? 'mailto:' + lead.email     : null);
  addId('Phone',   lead.phone,     lead.phone     ? 'tel:' + lead.phone.replace(/\s/g,'') : null);
  addId('Title',   lead.job_title, null);
  addId('Industry',lead.industry,  null);
  addId('Form',    lead.form_name, null);

  const idTableHtml = idRows.length
    ? '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:10px">' + idRows.join('') + '</table>'
    : '';

  /* ── Message block ───────────────────────────────────────── */
  const messageHtml = lead.message
    ? '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px">' +
      '<tr><td style="padding:16px 20px;background:#fffbeb;border-left:3px solid #F59E0B;border-radius:0 8px 8px 0">' +
      '<p style="margin:0 0 8px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#92400e">Their message</p>' +
      '<p style="margin:0;font-size:14px;color:#374151;white-space:pre-wrap;line-height:1.65">' + esc(lead.message) + '</p>' +
      '</td></tr></table>'
    : '';

  /* ── Details table (remaining fields) ───────────────────── */
  const order = Object.keys(LABELS).filter(k => !TABLE_SKIP.has(k));
  const seen  = new Set();
  const detailRows = [];
  const addDetail = (k) => {
    const v = lead[k];
    if (v == null || v === '' || TABLE_SKIP.has(k) || CARD_SKIP.has(k) && k !== 'form_name') return;
    seen.add(k);
    detailRows.push(
      '<tr>' +
      '<td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:11px;color:#9ca3af;white-space:nowrap;vertical-align:top;width:140px">' +
      esc(LABELS[k] || k) + '</td>' +
      '<td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#1f2937;vertical-align:top">' +
      esc(v) + '</td>' +
      '</tr>'
    );
  };
  order.forEach(addDetail);
  Object.keys(lead).forEach(k => { if (!seen.has(k)) addDetail(k); });

  const detailsHtml = detailRows.length
    ? '<p style="margin:24px 0 8px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#9ca3af">Submission details</p>' +
      '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:8px;border:1px solid #f3f4f6;overflow:hidden">' +
      detailRows.join('') + '</table>'
    : '';

  /* ── Next-action block ───────────────────────────────────── */
  const actionHtml =
    '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px">' +
    '<tr><td style="padding:14px 18px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px">' +
    '<p style="margin:0 0 4px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#166534">Next action</p>' +
    '<p style="margin:0;font-size:13px;color:#374151">' + esc(meta.action) + '</p>' +
    '</td></tr></table>';

  /* ── Reply CTA ───────────────────────────────────────────── */
  const replyHtml = lead.email
    ? '<a href="mailto:' + esc(lead.email) + '?subject=' + encodeURIComponent('Re: Your enquiry — QTSI') + '" ' +
      'style="display:inline-block;background:#0070F3;color:#ffffff;text-decoration:none;' +
      'padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;letter-spacing:.01em">' +
      'Reply to ' + esc(lead.name || lead.email) + '</a>'
    : '';

  /* ── Assemble (table-based for Outlook compatibility) ──── */
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#0b1020">' +

    /* outer wrapper */
    '<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0b1020">' +
    '<tr><td align="center" style="padding:32px 16px">' +

    /* card */
    '<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,.5)">' +

    /* ① dark header */
    '<tr><td bgcolor="#0b1020" style="padding:24px 28px 20px">' +
    '<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>' +
    '<td style="vertical-align:middle">' +
    '<img src="' + LOGO_URL + '" alt="QTSI" width="72" height="48" style="display:block;border:0;height:auto;max-height:48px;width:auto" />' +
    '</td>' +
    '<td align="right" style="vertical-align:middle">' +
    '<span style="display:inline-block;padding:4px 12px;border-radius:20px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;' +
    'background:' + meta.color + '22;color:' + meta.color + ';border:1px solid ' + meta.color + '44">' +
    esc(meta.label) + '</span>' +
    '</td>' +
    '</tr></table>' +
    '</td></tr>' +

    /* ② gradient stripe */
    '<tr><td style="height:3px;background:linear-gradient(90deg,#0070F3 0%,#5DB937 100%);font-size:0;line-height:0">&nbsp;</td></tr>' +

    /* ③ body */
    '<tr><td style="padding:28px 28px 32px;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Arial,sans-serif">' +

    /* lead name headline */
    '<p style="margin:0 0 4px;font-size:22px;font-weight:700;color:#0b1020;letter-spacing:-.02em">' +
    esc(lead.name || 'Unknown') +
    (lead.company ? '</p><p style="margin:0 0 16px;font-size:15px;font-weight:400;color:#6b7280">' + esc(lead.company) : '') +
    '</p>' +

    /* identity table */
    idTableHtml +

    /* message */
    messageHtml +

    /* details */
    detailsHtml +

    /* next action */
    actionHtml +

    /* CTA */
    (replyHtml ? '<div style="margin-top:24px">' + replyHtml + '</div>' : '') +

    '</td></tr>' +

    /* ④ footer */
    '<tr><td style="padding:16px 28px;border-top:1px solid #f3f4f6;background:#fafafa">' +
    '<p style="margin:0;font-size:11px;color:#9ca3af">' +
    'QTSI Website Lead System &nbsp;&middot;&nbsp; <a href="https://qtsi.ca" style="color:#9ca3af;text-decoration:none">qtsi.ca</a>' +
    '</p>' +
    '</td></tr>' +

    '</table>' + /* end card */
    '</td></tr></table>' + /* end outer */
    '</body></html>';
}
