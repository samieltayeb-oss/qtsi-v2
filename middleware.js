/* ═══════════════════════════════════════════════════════════════
   QTSI Executive Command Center™ — Edge Middleware
   Protects all /executive/* routes with session-cookie auth.

   Runs on Vercel Edge Runtime (V8 isolate — Web Crypto only).
   Validates the `exec_session` JWT cookie on every request.
   Invalid or missing cookie → redirect to /executive/login.
═══════════════════════════════════════════════════════════════ */

/* ── Paths that skip authentication ─────────────────────────── */
const PUBLIC_PATHS = ['/executive/login', '/executive/login.html'];
const ASSET_EXTS   = ['.css', '.js', '.png', '.webp', '.jpg', '.svg', '.ico'];

function shouldBypass(pathname) {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (pathname.includes('/api/'))      return true;
  for (const ext of ASSET_EXTS) {
    if (pathname.endsWith(ext)) return true;
  }
  return false;
}

/* ── Base64-URL helpers (no Buffer in Edge Runtime) ─────────── */
function base64UrlDecode(str) {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded);
  return new Uint8Array([...binary].map((c) => c.charCodeAt(0)));
}

/* ── Verify HMAC-SHA256 signature via SubtleCrypto ──────────── */
async function verifyToken(token, secret) {
  const dotIdx = token.indexOf('.');
  if (dotIdx < 1) return null;

  const dataStr = token.slice(0, dotIdx);
  const sigStr  = token.slice(dotIdx + 1);

  /* Import key */
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  /* Recompute signature over the data portion */
  const dataBytes      = encoder.encode(dataStr);
  const expectedSigBuf = await crypto.subtle.sign('HMAC', key, dataBytes);
  const expectedSig    = btoa(String.fromCharCode(...new Uint8Array(expectedSigBuf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  /* Constant-length comparison (fixed-time for equal-length strings) */
  if (expectedSig.length !== sigStr.length) return null;
  let mismatch = 0;
  for (let i = 0; i < expectedSig.length; i++) {
    mismatch |= expectedSig.charCodeAt(i) ^ sigStr.charCodeAt(i);
  }
  if (mismatch !== 0) return null;

  /* Decode and parse payload */
  try {
    const payloadBytes = base64UrlDecode(dataStr);
    const payload = JSON.parse(new TextDecoder().decode(payloadBytes));

    /* Check expiration */
    if (typeof payload.exp !== 'number' || payload.exp < Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}

/* ── Middleware entry point ──────────────────────────────────── */
export default async function middleware(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  /* Let public paths through without auth */
  if (shouldBypass(pathname)) {
    return new Response(null, { headers: { 'x-middleware-next': '1' } });
  }

  /* Read session cookie */
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/(?:^|; )exec_session=([^;]+)/);
  const token = match ? match[1] : null;

  if (!token) {
    return Response.redirect(new URL('/executive/login', request.url));
  }

  /* Validate JWT */
  const secret = process.env.EXEC_TOKEN_SECRET || 'qtsi-exec-secret-key-2026';

  const payload = await verifyToken(token, secret);
  if (!payload) {
    /* Token invalid or expired — clear stale cookie and redirect */
    const response = Response.redirect(new URL('/executive/login', request.url));
    response.headers.set('Set-Cookie', 'exec_session=; Path=/executive/; Max-Age=0');
    return response;
  }

  /* Authenticated — allow through */
  const response = new Response(null, {
    headers: {
      'x-middleware-next': '1'
    }
  });
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  return response;
}

/* ── Route matcher — only run on /executive/* ────────────────── */
export const config = {
  matcher: ['/executive/:path*'],
};
