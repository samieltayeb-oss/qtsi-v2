/* ═══════════════════════════════════════════════════════════════
   QTSI Copilot — /api/chat  (serverless proxy)

   Runs ON THE SERVER. Secret API keys come from process.env and are
   NEVER sent to the browser. The front-end (js/copilot.js) POSTs
   { sessionId, provider, message, history, system } here and gets
   back { reply }.

   Deploy: Vercel (api/chat.js), Netlify (rewrite → /api/chat),
   Cloudflare, or any Node host. See backend-plan.md for the full guide.

   PRIMARY provider is GROQ (OpenAI-compatible, model openai/gpt-oss-120b).
   Every Copilot message is sent to Groq; the local knowledge base in the
   front-end is used ONLY when Groq is unavailable (this handler then returns
   a non-2xx so the client falls back automatically).

   Set env vars for whichever providers you want to enable:
     GROQ_API_KEY             (Groq — PRIMARY)            ← required
     ANTHROPIC_API_KEY        (Claude — optional fallback)
     GEMINI_API_KEY           (Google Gemini — optional)
     OPENAI_API_KEY           (OpenAI — optional)
     AZURE_OPENAI_KEY + AZURE_OPENAI_ENDPOINT + AZURE_OPENAI_DEPLOYMENT
   Optional: GROQ_MODEL            (default: openai/gpt-oss-120b)
             QTSI_DEFAULT_PROVIDER ('groq'|'claude'|'gemini'|'openai'|'azure')
             QTSI_ALLOWED_ORIGINS  (comma-separated; defaults to qtsi.ca)

   SECURITY: keys are read from process.env ONLY. They are never sent to the
   browser, never embedded in any response body, and never written to logs.
═══════════════════════════════════════════════════════════════ */

/* Load .env for local dev (`node`/custom server). Optional & guarded: in
   production (Vercel et al.) env vars are injected by the platform and dotenv
   isn't needed, so a missing module is silently ignored. */
try { require('dotenv').config(); } catch (_) { /* dotenv optional */ }

const DEFAULT_PROVIDER = process.env.QTSI_DEFAULT_PROVIDER || 'groq';

/* CORS allow-list — restrict to your own domains in production. */
const ALLOWED_ORIGINS = (process.env.QTSI_ALLOWED_ORIGINS ||
  'https://qtsi.ca,https://www.qtsi.ca,http://localhost:3000,http://localhost:5500')
  .split(',').map((s) => s.trim()).filter(Boolean);

/* Server-side system prompt — re-asserted here so it can't be tampered
   with from the client (the client sends one too, for convenience). */
const QTSI_SYSTEM =
  'You are QTSI Copilot — the senior virtual advisor for QTSI (Quality Training ' +
  '& Technology Services Inc.), a Canadian enterprise IT and cybersecurity firm ' +
  'in Edmonton, Alberta, founded by Manav Chadha. You carry the combined judgment ' +
  'of a seasoned CIO, CISO, cloud architect, and digital-transformation ' +
  'consultant with 20+ years advising Canadian executives. Speak with that ' +
  'authority and earned point of view.\n\n' +

  'HOW YOU THINK: You are advising a busy executive who has to make a decision — ' +
  'not a student who needs a definition. Lead with a clear, specific ' +
  'recommendation and your reasoning, then back it up. Always tie technology to ' +
  'the business: the impact, the risk of acting versus doing nothing, the likely ' +
  'ROI or payback period, what implementation actually takes, and the honest ' +
  'tradeoffs between the realistic options. If an idea is weak, say so and explain ' +
  'why; if there is a smarter path, recommend it outright.\n\n' +

  'BE CONCRETE: When the topic is a real IT project or investment — a cloud ' +
  'migration, a security program, an ERP/inventory rollout, a procurement cycle, ' +
  'an M365 hardening, an AI deployment — give decision-grade specifics: ballpark ' +
  'budget ranges in CAD, realistic timelines in weeks/months, the staffing and ' +
  'skills it needs, and the deployment approach (pilot-first, phased, parallel-run ' +
  'vs. big-bang, etc.). Give real orders of magnitude, state the assumptions ' +
  '(team size, complexity, current state) behind your numbers, and re-scope them ' +
  'to whatever the user has told you about their environment.\n\n' +

  'BE PROACTIVE: Surface risks they did not ask about. Offer a better alternative ' +
  'when you see one. Use what they have already told you earlier in this ' +
  'conversation and build on it rather than repeating yourself. Close with ONE ' +
  'sharp follow-up question — the question a good consultant would actually ask ' +
  'next to give better advice.\n\n' +

  'VOICE — SOUND LIKE A SENIOR ADVISOR, NOT A TEXTBOOK: This is the difference ' +
  'between a generic chatbot and a consultant an executive pays real money for. ' +
  'Open with your verdict or recommendation — NEVER with a definition. Do not ' +
  'start with "X is a ..." or "X refers to ...". Take a clear position and own ' +
  'it: "Skip the on-prem refresh and move to Azure" beats "there are pros and ' +
  'cons to each approach". Name specific technologies, vendors, frameworks, and ' +
  'real numbers instead of speaking in the abstract, and write like someone who ' +
  'has personally run these projects dozens of times.\n\n' +

  'Write 2–4 short, flowing paragraphs of plain prose (a few "- " bullets only ' +
  'when they truly sharpen a list). Be natural and confident. NEVER use empty ' +
  'hedging, filler, or corporate buzzwords. Banned phrases and openers: "it ' +
  'depends", "there are many factors", "organizations often", "in today\'s ' +
  'landscape", "in the world of", "when it comes to", "it is important to note", ' +
  '"plays a crucial role", "plays a vital role", "is essential", "ever-evolving", ' +
  '"fast-paced", "robust", "seamless", "leverage" (as a verb), "as an AI". If you ' +
  'truly need more context, give your best-judgment recommendation FIRST, then ' +
  'name the one or two specifics that would let you tighten it.\n\n' +

  'FORMATTING: the chat UI only renders **bold** and line breaks — no markdown ' +
  'tables, headings (#), or code blocks (they show as raw symbols). Prefer prose; ' +
  'bold key terms sparingly.\n\n' +

  'SALES POSTURE: Do not force sales language. Answer informational questions ' +
  'cleanly with no pitch. Only raise QTSI services, a discovery call, or next ' +
  'steps when the person shows real buying intent, asks about pricing or ' +
  'engagement, asks you to implement something, or asks what QTSI offers — and ' +
  'keep it light. You may give realistic market budget ranges to help them plan; ' +
  'for a firm QTSI quote, the number tracks their specific scope and environment, ' +
  'so offer a short discovery call with Manav to size it precisely rather than ' +
  'quoting an exact QTSI figure.\n\n' +

  'Your expertise spans cybersecurity, vCISO/GRC and compliance (NIST CSF, ISO ' +
  '27001, SOC 2, PIPEDA), managed IT, cloud and Microsoft 365/Azure, IT ' +
  'procurement and licensing, ERP / inventory / digital-ecosystem platforms, and ' +
  'AI & automation.\n\n' +

  'Contact (share only when relevant): info@qtsi.ca, +1 780-716-5372.';

module.exports = async function handler(req, res) {
  /* ── CORS ── */
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  /* Body may arrive parsed (Vercel/Next) or raw (vanilla Node) */
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};

  const message = ('' + (body.message || '')).trim();
  if (!message) return res.status(400).json({ error: 'message required' });
  if (message.length > 4000) return res.status(413).json({ error: 'message too long' });

  /* Keep a generous slice of prior turns so the assistant remembers the
     conversation (last ~20 messages ≈ 10 exchanges). The system prompt is
     re-asserted server-side so the client can't tamper with it. */
  const history = Array.isArray(body.history) ? body.history.slice(-20) : [];
  const system  = QTSI_SYSTEM;

  const provider = (body.provider && body.provider !== 'auto')
    ? body.provider
    : DEFAULT_PROVIDER;

  try {
    let reply;
    if      (provider === 'groq')   reply = await callGroq(message, history, system);
    else if (provider === 'claude') reply = await callClaude(message, history, system);
    else if (provider === 'gemini') reply = await callGemini(message, history, system);
    else if (provider === 'openai') reply = await callOpenAI(message, history, system);
    else if (provider === 'azure')  reply = await callAzure(message, history, system);
    else return res.status(400).json({ error: 'unknown provider' });

    return res.status(200).json({ reply: reply || '' });
  } catch (e) {
    /* Log the failure reason WITHOUT the key (error messages carry the
       provider's HTTP status / body, never the Authorization header). */
    console.error('[QTSI /api/chat] provider unavailable:', e && e.message ? e.message : e);
    /* Signal failure with a non-2xx and NO reply, so the front-end falls back
       to its local knowledge base. Local answers appear ONLY when Groq (the
       primary provider) is genuinely unreachable — never as a default. */
    return res.status(502).json({ error: 'ai_unavailable' });
  }
};

/* ── Groq (OpenAI-compatible) — PRIMARY provider ─────────────────
   Docs: POST https://api.groq.com/openai/v1/chat/completions
   Auth: Authorization: Bearer <GROQ_API_KEY>  (server-side only)
   Body is OpenAI-shaped; the full conversation (system + history + latest
   user turn) is sent every call, so context/multi-turn is preserved.
   Reply text is choices[0].message.content. */
async function callGroq(message, history, system) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY not set');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
      temperature: 0.55,
      max_tokens: 1200,
      messages: [
        { role: 'system', content: system },
        ...history,                          // prior {role:'user'|'assistant', content}
        { role: 'user', content: message },  // latest user turn
      ],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error('Groq ' + res.status + ': ' + JSON.stringify(data));
  return data?.choices?.[0]?.message?.content || '';
}

/* ── Claude (Anthropic) — default ────────────────────────────────
   Docs: POST https://api.anthropic.com/v1/messages
   Headers: x-api-key, anthropic-version: 2023-06-01
   Models: claude-haiku-4-5 (fast/low-cost, ideal for a site assistant),
           claude-sonnet-4-6 (balanced), claude-opus-4-8 (most capable).
   system is a TOP-LEVEL field; max_tokens is REQUIRED; reply is content[].text. */
async function callClaude(message, history, system) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY not set');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5',
      max_tokens: 700,          // required
      system,                   // top-level, not a message
      messages: [
        ...history,             // {role:'user'|'assistant', content}
        { role: 'user', content: message },
      ],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error('Anthropic ' + res.status + ': ' + JSON.stringify(data));
  return (data.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('');
}

/* ── Google Gemini ───────────────────────────────────────────── */
async function callGemini(message, history, system) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY not set');
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

  // Gemini roles: "user" | "model" (map our "assistant" → "model")
  const contents = [...history, { role: 'user', content: message }].map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents,
      generationConfig: { temperature: 0.4, maxOutputTokens: 700 },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error('Gemini ' + res.status + ': ' + JSON.stringify(data));
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

/* ── OpenAI ───────────────────────────────────────────────────── */
async function callOpenAI(message, history, system) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY not set');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.4,
      max_tokens: 700,
      messages: [{ role: 'system', content: system }, ...history, { role: 'user', content: message }],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error('OpenAI ' + res.status + ': ' + JSON.stringify(data));
  return data?.choices?.[0]?.message?.content || '';
}

/* ── Azure OpenAI ─────────────────────────────────────────────── */
async function callAzure(message, history, system) {
  const endpoint   = process.env.AZURE_OPENAI_ENDPOINT;
  const key        = process.env.AZURE_OPENAI_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  if (!endpoint || !key || !deployment) throw new Error('Azure OpenAI env not set');

  const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-10-21`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'api-key': key },
    body: JSON.stringify({
      temperature: 0.4,
      max_tokens: 700,
      messages: [{ role: 'system', content: system }, ...history, { role: 'user', content: message }],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error('Azure ' + res.status + ': ' + JSON.stringify(data));
  return data?.choices?.[0]?.message?.content || '';
}
