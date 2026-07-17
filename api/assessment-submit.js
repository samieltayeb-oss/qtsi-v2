/* ═══════════════════════════════════════════════════════════════
   QTSI — /api/assessment-submit
   Receives completed paid assessment data, stores to Supabase,
   and sends a formatted results email to info@qtsi.ca.

   Client sends: { token, answers, context, totalScore, catScores,
                   maturity, roadmapText, completedAt }
   Returns: { ok: true, submissionId }
═══════════════════════════════════════════════════════════════ */

const crypto = require('crypto');

const ALLOWED_ORIGINS = (process.env.QTSI_ALLOWED_ORIGINS ||
  'https://qtsi.ca,https://www.qtsi.ca,http://localhost:3000,http://localhost:5500')
  .split(',').map((s) => s.trim()).filter(Boolean);

/* ── Token verification ─────────────────────────────────────── */
function verifyToken(token, secret) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [data, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', secret).update(data).digest('base64url');
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return null;
  } catch { return null; }
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString());
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch { return null; }
}

/* ── Supabase REST insert ───────────────────────────────────── */
async function insertToSupabase(record) {
  const url    = process.env.SUPABASE_URL;
  const apiKey = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !apiKey) return { skipped: true, reason: 'supabase not configured' };

  const res = await fetch(`${url}/rest/v1/paid_assessments`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'apikey':        apiKey,
      'Authorization': `Bearer ${apiKey}`,
      'Prefer':        'return=representation',
    },
    body: JSON.stringify(record),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Supabase error ${res.status}: ${text}`);
  }
  const data = await res.json();
  return data && data[0] ? data[0] : {};
}

/* ── Email via Resend ──────────────────────────────────────── */
async function sendResultsEmail(client, data) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { skipped: true, reason: 'resend not configured' };

  const to   = process.env.LEAD_EMAIL_TO   || 'info@qtsi.ca';
  const from = process.env.LEAD_EMAIL_FROM || 'QTSI Assessment <noreply@qtsi.ca>';

  await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      from,
      to:       to.split(',').map((s) => s.trim()),
      reply_to: client.email || undefined,
      subject:  `[PAID ASSESSMENT] ${client.name} @ ${client.company || 'Unknown'} — Score: ${data.totalScore}/100 (${data.maturity})`,
      html:     buildResultsEmail(client, data),
    }),
  });
}

/* ── Results email HTML ─────────────────────────────────────── */
function buildResultsEmail(client, data) {
  const esc = (s) => String(s || '')
    .replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const LOGO_URL = 'https://www.qtsi.ca/images/qtsi-logo.png';

  const maturityColor = {
    Reactive: '#EF4444', Aware: '#F59E0B', Controlled: '#3B82F6',
    Governed: '#22C55E', Optimized: '#5DB937',
  }[data.maturity] || '#6B7280';

  const catRows = Object.entries(data.catScores || {}).map(([cat, score]) => {
    const pct = Math.round((score / 20) * 100);
    return `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#374151;text-transform:capitalize">${esc(cat)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#374151;font-weight:600">${score}/20</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;color:${pct >= 75 ? '#22C55E' : pct >= 50 ? '#F59E0B' : '#EF4444'};font-weight:600">${pct}%</td>
    </tr>`;
  }).join('');

  const answerRows = Object.entries(data.answers || {}).map(([idx, val]) => {
    return `<tr>
      <td style="padding:6px 10px;border-bottom:1px solid #f9fafb;font-size:11px;color:#6b7280">Q${Number(idx)+1}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #f9fafb;font-size:11px;color:#374151">${val}/4</td>
    </tr>`;
  }).join('');

  const completedDate = new Date(data.completedAt || Date.now()).toLocaleDateString('en-CA', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0b1020;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0b1020">
<tr><td align="center" style="padding:32px 16px">
<table width="640" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,.5)">

<!-- Header -->
<tr><td bgcolor="#0b1020" style="padding:24px 28px 20px">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td><img src="${LOGO_URL}" alt="QTSI" width="80" style="display:block;height:auto" /></td>
<td align="right" style="vertical-align:middle">
<span style="display:inline-block;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;background:#0070F322;color:#3B9EFF;border:1px solid #0070F344">PAID ASSESSMENT RESULT</span>
</td></tr></table>
</td></tr>

<!-- Gradient stripe -->
<tr><td style="height:3px;background:linear-gradient(90deg,#0070F3 0%,#5DB937 100%);font-size:0;line-height:0">&nbsp;</td></tr>

<!-- Body -->
<tr><td style="padding:28px 28px 32px">

<p style="margin:0 0 4px;font-size:22px;font-weight:700;color:#0b1020">${esc(client.name)}</p>
<p style="margin:0 0 20px;font-size:15px;color:#6b7280">${esc(client.company || '')}${client.role ? ' · ' + esc(client.role) : ''}</p>

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px">
<tr><td style="padding:5px 0;font-size:12px;color:#9ca3af;width:100px">Email</td>
<td style="padding:5px 0 5px 12px;font-size:13px"><a href="mailto:${esc(client.email)}" style="color:#0070F3;font-weight:500">${esc(client.email)}</a></td></tr>
<tr><td style="padding:5px 0;font-size:12px;color:#9ca3af">Completed</td>
<td style="padding:5px 0 5px 12px;font-size:13px;color:#374151">${esc(completedDate)}</td></tr>
<tr><td style="padding:5px 0;font-size:12px;color:#9ca3af">Industry</td>
<td style="padding:5px 0 5px 12px;font-size:13px;color:#374151">${esc(data.context && data.context.industry || 'Not specified')}</td></tr>
<tr><td style="padding:5px 0;font-size:12px;color:#9ca3af">Org Size</td>
<td style="padding:5px 0 5px 12px;font-size:13px;color:#374151">${esc(data.context && data.context.size || 'Not specified')}</td></tr>
</table>

<!-- Score hero -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;background:#0b1020;border-radius:10px;overflow:hidden">
<tr><td style="padding:24px 28px;text-align:center">
<div style="font-size:56px;font-weight:800;color:#C9A84C;line-height:1">${esc(String(data.totalScore))}<span style="font-size:24px;color:#94A3B8">/100</span></div>
<div style="display:inline-block;margin-top:12px;padding:6px 18px;border-radius:20px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;background:${maturityColor}22;color:${maturityColor};border:1px solid ${maturityColor}44">${esc(data.maturity)}</div>
</td></tr>
</table>

<!-- Category scores -->
<p style="margin:0 0 8px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#9ca3af">Category Breakdown</p>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:8px;border:1px solid #f3f4f6;overflow:hidden;margin-bottom:24px">
<tr style="background:#f9fafb">
<th style="padding:8px 12px;font-size:11px;font-weight:700;text-align:left;color:#6b7280;text-transform:uppercase;letter-spacing:.06em">Dimension</th>
<th style="padding:8px 12px;font-size:11px;font-weight:700;text-align:left;color:#6b7280;text-transform:uppercase;letter-spacing:.06em">Score</th>
<th style="padding:8px 12px;font-size:11px;font-weight:700;text-align:left;color:#6b7280;text-transform:uppercase;letter-spacing:.06em">%</th>
</tr>
${catRows}
</table>

<!-- Roadmap -->
${data.roadmapText ? `<p style="margin:0 0 8px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#9ca3af">90-Day Roadmap (Top Priorities)</p>
<div style="padding:16px 20px;background:#f8fafc;border-left:3px solid #0070F3;border-radius:0 8px 8px 0;margin-bottom:24px">
<pre style="margin:0;font-size:11px;color:#374151;white-space:pre-wrap;line-height:1.7;font-family:inherit">${esc(data.roadmapText)}</pre>
</div>` : ''}

<!-- Raw answers (collapsible context for building report) -->
<p style="margin:0 0 8px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#9ca3af">Raw Answer Data (for report generation)</p>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:8px;border:1px solid #f3f4f6;overflow:hidden;margin-bottom:24px">
${answerRows}
</table>

<!-- Next action -->
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="padding:14px 18px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px">
<p style="margin:0 0 4px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#166534">Next action</p>
<p style="margin:0;font-size:13px;color:#374151">Send the client their tailored AI Governance Readiness Report within 5–7 business days. Review their roadmap priorities and lowest-scoring dimensions before the debrief call.</p>
</td></tr>
</table>

${client.email ? `<div style="margin-top:24px"><a href="mailto:${esc(client.email)}?subject=${encodeURIComponent('Your AI Governance Readiness Report — QTSI')}" style="display:inline-block;background:#0070F3;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600">Reply to ${esc(client.name)}</a></div>` : ''}

</td></tr>

<!-- Footer -->
<tr><td style="padding:16px 28px;border-top:1px solid #f3f4f6;background:#fafafa">
<p style="margin:0;font-size:11px;color:#9ca3af">QTSI Paid Assessment System &nbsp;·&nbsp; <a href="https://qtsi.ca" style="color:#9ca3af;text-decoration:none">qtsi.ca</a> &nbsp;·&nbsp; info@qtsi.ca</p>
</td></tr>

</table>
</td></tr></table>
</body></html>`;
}

/* ── Main handler ────────────────────────────────────────────── */
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
  body = body || {};

  /* Verify session token */
  const secret  = process.env.ASSESSMENT_TOKEN_SECRET || 'qtsi-fallback-secret-change-in-prod';
  const payload = verifyToken(body.token, secret);
  if (!payload) {
    return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
  }

  const client = { name: payload.name, company: payload.company, email: payload.email, role: payload.role };

  /* Build DB record */
  const record = {
    client_name:    client.name,
    client_email:   client.email,
    client_company: client.company,
    client_role:    client.role,
    org_size:       (body.context && body.context.size)     || null,
    industry:       (body.context && body.context.industry) || null,
    region:         (body.context && body.context.region)   || null,
    answers:        body.answers     || {},
    total_score:    body.totalScore  || 0,
    maturity_level: body.maturity    || '',
    category_scores: body.catScores || {},
    roadmap_text:   body.roadmapText || '',
    completed_at:   new Date(body.completedAt || Date.now()).toISOString(),
    ip_address:     req.headers['x-forwarded-for'] || req.socket.remoteAddress || '',
  };

  const results = await Promise.allSettled([
    insertToSupabase(record),
    sendResultsEmail(client, {
      totalScore:  body.totalScore,
      maturity:    body.maturity,
      catScores:   body.catScores,
      answers:     body.answers,
      context:     body.context,
      roadmapText: body.roadmapText,
      completedAt: body.completedAt,
    }),
  ]);

  const [dbResult, emailResult] = results;

  if (dbResult.status === 'rejected') {
    console.error('[QTSI /api/assessment-submit] DB error:', dbResult.reason);
  }
  if (emailResult.status === 'rejected') {
    console.error('[QTSI /api/assessment-submit] Email error:', emailResult.reason);
  }

  const submissionId = (dbResult.status === 'fulfilled' && dbResult.value && dbResult.value.id) || null;

  console.log(`[QTSI /api/assessment-submit] submitted — ${client.name} <${client.email}> score=${body.totalScore}`);

  return res.status(200).json({ ok: true, submissionId });
};
