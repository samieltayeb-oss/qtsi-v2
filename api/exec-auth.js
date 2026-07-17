/* ═══════════════════════════════════════════════════════════════
   QTSI Executive Command Center™ — /api/exec-auth
   Handles login (POST) and logout (DELETE) for the executive
   dashboard session.

   POST  → validate password, issue signed JWT as httpOnly cookie
   DELETE → clear session cookie

   Follows the same coding patterns as /api/assessment-auth.js:
   HMAC-SHA256 signing, crypto.timingSafeEqual, 800ms brute-force
   delay, CORS via QTSI_ALLOWED_ORIGINS.
═══════════════════════════════════════════════════════════════ */

const crypto = require('crypto');

/* ── CORS allow-list ────────────────────────────────────────── */
const ALLOWED_ORIGINS = (process.env.QTSI_ALLOWED_ORIGINS ||
  'https://qtsi.ca,https://www.qtsi.ca,http://localhost:3000')
  .split(',').map((s) => s.trim()).filter(Boolean);

/* ── Token helpers ──────────────────────────────────────────── */
function signToken(payload, secret) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig  = crypto.createHmac('sha256', secret).update(data).digest('base64url');
  return data + '.' + sig;
}

/* ── Cookie serialisation ───────────────────────────────────── */
function buildCookie(name, value, maxAge) {
  const parts = [
    `${name}=${value}`,
    'HttpOnly',
    'Secure',
    'SameSite=Strict',
    'Path=/executive/',
    `Max-Age=${maxAge}`,
  ];
  return parts.join('; ');
}

/* ── Main handler ───────────────────────────────────────────── */
module.exports = async function handler(req, res) {
  /* ── CORS ────────────────────────────────────────────────── */
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  /* ── Preflight ───────────────────────────────────────────── */
  if (req.method === 'OPTIONS') return res.status(204).end();

  /* ════════════════════════════════════════════════════════════
     DELETE — Logout (clear session cookie)
  ════════════════════════════════════════════════════════════ */
  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', buildCookie('exec_session', '', 0));
    return res.status(200).json({ success: true, message: 'Session ended.' });
  }

  /* ════════════════════════════════════════════════════════════
     POST — Login (validate password, issue JWT cookie)
  ════════════════════════════════════════════════════════════ */
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  /* Parse body */
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};

  const { password } = body;

  if (!password) {
    return res.status(400).json({ success: false, message: 'Password is required.' });
  }

  /* ── Validate env vars ───────────────────────────────────── */
  const expectedPassword = process.env.EXEC_PASSWORD || '';
  if (!expectedPassword) {
    console.error('[QTSI /api/exec-auth] EXEC_PASSWORD env var not set');
    return res.status(503).json({ success: false, message: 'Executive access not configured.' });
  }

  const tokenSecret = process.env.EXEC_TOKEN_SECRET || '';
  if (!tokenSecret) {
    console.error('[QTSI /api/exec-auth] EXEC_TOKEN_SECRET env var not set');
    return res.status(503).json({ success: false, message: 'Executive access not configured.' });
  }

  /* ── Constant-time password comparison ───────────────────── */
  const providedBuf = Buffer.from(String(password).trim());
  const expectedBuf = Buffer.from(expectedPassword.trim());
  const lengthOk    = providedBuf.length === expectedBuf.length;
  const match       = lengthOk && crypto.timingSafeEqual(providedBuf, expectedBuf);

  if (!match) {
    /* 800ms delay to slow brute-force attempts */
    await new Promise((r) => setTimeout(r, 800));
    return res.status(401).json({ success: false, message: 'Invalid credentials.' });
  }

  /* ── Issue JWT session cookie ────────────────────────────── */
  const SESSION_MAX_AGE = 604800; /* 7 days in seconds */
  const nowMs = Date.now();

  const payload = {
    role: 'executive',
    iat:  nowMs,
    exp:  nowMs + SESSION_MAX_AGE * 1000,
  };

  const token = signToken(payload, tokenSecret);

  res.setHeader('Set-Cookie', buildCookie('exec_session', token, SESSION_MAX_AGE));

  console.log(`[QTSI /api/exec-auth] executive session granted at ${new Date(nowMs).toISOString()}`);

  return res.status(200).json({ success: true, message: 'Authenticated.' });
};
