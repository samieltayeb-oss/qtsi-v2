/* ═══════════════════════════════════════════════════════════════
   QTSI — /api/lead  (V2 Certified Backend)

   Payload Contract (V1 + V2 Compatible):
   - name (string)
   - email (string)
   - company (string)
   - role (string)
   - phone (string)
   - service / service_type (string)
   - message (string)
   - source / source_page (string)
   - consent (string/boolean)
   - _gotcha (honeypot)

   Execution Flow:
   1. Validation & Honeypot Check
   2. Input Sanitization & Normalization
   3. Supabase Storage Insert (Primary Persistence)
   4. Resend Email Notification
   5. Structured API Response
═══════════════════════════════════════════════════════════════ */

const ALLOWED_ORIGINS = (process.env.QTSI_ALLOWED_ORIGINS ||
  'https://qtsi.ca,https://www.qtsi.ca,https://qtsi-v2.vercel.app,http://localhost:3000,http://localhost:5173,http://localhost:5500')
  .split(',').map((s) => s.trim()).filter(Boolean);

// Helpers
const escapeHtml = (unsafe) => (unsafe || '').replace(/[&<"'>]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[m]);
const truncate = (str, len = 2000) => (str && str.length > len ? str.substring(0, len) + '...' : str);

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin) || process.env.VERCEL_ENV !== 'production') {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  let lead = req.body;
  if (typeof lead === 'string') { try { lead = JSON.parse(lead); } catch { lead = {}; } }
  lead = lead || {};

  // 1. Honeypot & Spam Protection
  if (lead._gotcha) return res.status(200).json({ ok: true }); // Silently accept bots
  
  if (!lead.email && !lead.phone) {
    return res.status(400).json({ error: 'Contact handle (email or phone) is required.' });
  }

  // 2. Normalization & Sanitization
  const normalized = {
    name: escapeHtml(truncate(lead.name || lead.full_name, 200)),
    email: escapeHtml(truncate(lead.email, 200)).toLowerCase(),
    phone: escapeHtml(truncate(lead.phone, 50)),
    company: escapeHtml(truncate(lead.company, 200)),
    role: escapeHtml(truncate(lead.role || lead.job_title, 200)),
    service_type: escapeHtml(truncate(lead.service || lead.service_type || lead.interest, 200)),
    message: escapeHtml(truncate(lead.message, 5000)),
    source_page: escapeHtml(truncate(lead.source_page || lead.source || lead.Source_Page, 200)),
    buying_journey: escapeHtml(truncate(lead.buying_journey, 100)),
    campaign: escapeHtml(truncate(lead.campaign, 100)),
    consent: lead.consent === 'on' || lead.consent === true || lead.consent === 'true',
    user_agent: req.headers['user-agent'] || '',
    referrer: req.headers['referer'] || '',
    metadata: { 
      raw_source: lead.source,
      ip: req.headers['x-forwarded-for'] || ''
    }
  };

  let insertedId = null;
  let supabaseSuccess = false;

  // 3. Supabase Insert
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (supabaseUrl && supabaseKey) {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(normalized)
      });
      
      if (!response.ok) throw new Error(`Supabase error: ${await response.text()}`);
      const result = await response.json();
      if (result && result.length > 0) {
        insertedId = result[0].id;
        supabaseSuccess = true;
      }
    } catch (err) {
      console.error('Supabase insert failed:', err);
      // We don't hard fail if DB is down, we still try to email
    }
  }

  // 4. Resend Email Notification
  const resendKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.LEAD_NOTIFICATION_EMAIL || 'info@qtsi.ca';
  let emailSuccess = false;
  let emailError = null;

  if (resendKey) {
    try {
      const htmlBody = `
        <h2>New QTSI Inquiry</h2>
        <p><strong>Name:</strong> ${normalized.name}</p>
        <p><strong>Email:</strong> ${normalized.email}</p>
        <p><strong>Phone:</strong> ${normalized.phone}</p>
        <p><strong>Company:</strong> ${normalized.company}</p>
        <p><strong>Service:</strong> ${normalized.service_type}</p>
        <p><strong>Source:</strong> ${normalized.source_page}</p>
        <hr/>
        <p><strong>Message:</strong></p>
        <pre style="font-family:inherit; white-space:pre-wrap;">${normalized.message}</pre>
      `;

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendKey}` },
        body: JSON.stringify({
          from: 'QTSI Website <onboarding@resend.dev>',
          to: toEmail,
          subject: `New Lead: ${normalized.name || 'Unknown'} - ${normalized.company || ''}`,
          html: htmlBody,
          reply_to: normalized.email || undefined
        })
      });

      if (!res.ok) throw new Error(await res.text());
      emailSuccess = true;
    } catch (err) {
      console.error('Resend email failed:', err);
      emailError = err.toString();
    }
  } else {
    emailError = 'RESEND_API_KEY not configured';
  }

  // 5. Post-Flight Sync (Update DB with Email Status if needed)
  if (supabaseSuccess && !emailSuccess && supabaseUrl && supabaseKey) {
    // Fire and forget update
    fetch(`${supabaseUrl}/rest/v1/leads?id=eq.${insertedId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ 
        email_delivery_status: 'failed',
        email_delivery_error: emailError 
      })
    }).catch(console.error);
  } else if (supabaseSuccess && emailSuccess && supabaseUrl && supabaseKey) {
    fetch(`${supabaseUrl}/rest/v1/leads?id=eq.${insertedId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
      body: JSON.stringify({ 
        email_delivery_status: 'delivered',
        email_sent_at: new Date().toISOString()
      })
    }).catch(console.error);
  }

  // 6. Structured Response
  if (!supabaseSuccess && !emailSuccess) {
    return res.status(500).json({ error: 'System error: Unable to process inquiry.', partial: false });
  }

  return res.status(200).json({ 
    ok: true, 
    id: insertedId,
    db_status: supabaseSuccess ? 'saved' : 'failed',
    email_status: emailSuccess ? 'sent' : 'failed'
  });
}
