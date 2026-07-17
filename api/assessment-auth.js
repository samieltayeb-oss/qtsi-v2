/* ═══════════════════════════════════════════════════════════════
   QTSI — /api/assessment-auth
   Validates the paid assessment access code and returns a session token.

   Client sends: { name, company, email, role, code }
   Server checks: code === ASSESSMENT_ACCESS_CODE (env var)
   Returns: { ok: true, token: <signed_token>, client: { name, company, email, role } }

   Token is a base64-encoded JSON payload signed with ASSESSMENT_TOKEN_SECRET.
   Expiry: 24 hours. Checked by /api/assessment-submit before storing data.
═══════════════════════════════════════════════════════════════ */

const crypto = require('crypto');

const ALLOWED_ORIGINS = (process.env.QTSI_ALLOWED_ORIGINS ||
  'https://qtsi.ca,https://www.qtsi.ca,http://localhost:3000,http://localhost:5500')
  .split(',').map((s) => s.trim()).filter(Boolean);

function esc(s) {
  return String(s || '')
    .replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function signToken(payload, secret) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig  = crypto.createHmac('sha256', secret).update(data).digest('base64url');
  return data + '.' + sig;
}

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

  const { name, company, email, role, code } = body;

  /* Validate required fields */
  if (!name || !email || !code) {
    return res.status(400).json({ error: 'name, email, and access code are required' });
  }

  /* Simple email format check */
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'invalid email address' });
  }

  /* Validate access code — constant-time compare to prevent timing attacks */
  const expectedCode = process.env.ASSESSMENT_ACCESS_CODE || '';
  if (!expectedCode) {
    console.error('[QTSI /api/assessment-auth] ASSESSMENT_ACCESS_CODE env var not set');
    return res.status(503).json({ error: 'assessment access not configured' });
  }

  const providedBuf  = Buffer.from(code.trim());
  const expectedBuf  = Buffer.from(expectedCode.trim());
  const lengthOk     = providedBuf.length === expectedBuf.length;
  const match        = lengthOk && crypto.timingSafeEqual(providedBuf, expectedBuf);

  if (!match) {
    /* Short delay to slow brute-force */
    await new Promise((r) => setTimeout(r, 800));
    return res.status(401).json({ error: 'Invalid access code. Please contact info@qtsi.ca.' });
  }

  /* Issue session token */
  const secret  = process.env.ASSESSMENT_TOKEN_SECRET || 'qtsi-fallback-secret-change-in-prod';
  const payload = {
    name:    name.trim().slice(0, 120),
    company: (company || '').trim().slice(0, 120),
    email:   email.trim().toLowerCase().slice(0, 200),
    role:    (role || '').trim().slice(0, 80),
    iat:     Date.now(),
    exp:     Date.now() + 24 * 60 * 60 * 1000, /* 24 hours */
  };

  const token = signToken(payload, secret);

  console.log(`[QTSI /api/assessment-auth] access granted — ${payload.name} <${payload.email}> @ ${payload.company}`);

  return res.status(200).json({ ok: true, token, client: { name: payload.name, company: payload.company, email: payload.email } });
};
