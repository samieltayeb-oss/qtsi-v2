const fs = require('fs');

const files = ['index.html', 'ai-governance.html', 'executive-advisory.html', 'academy.html'];

const seoMetadata = (page) => `
  <link rel="canonical" href="https://www.qtsi.ca/${page}" />
  <meta property="og:title" content="QTSI | Executive Advisory & AI Governance" />
  <meta property="og:description" content="Board-level cyber defense and AI governance. Quality Training & Technology Services Inc." />
  <meta property="og:url" content="https://www.qtsi.ca/${page}" />
  <meta property="og:image" content="https://www.qtsi.ca/qtsi-logo.webp" />
  <meta name="twitter:card" content="summary_large_image" />
`;

const fallbackFooter = `
  <!-- Semantic Fallback Footer -->
  <footer class="exec-footer-fallback" style="padding: 2rem; background: #f8fafc; border-top: 1px solid #e2e8f0; font-family: sans-serif;">
    <div style="max-width: 1200px; margin: 0 auto; display: flex; flex-wrap: wrap; gap: 2rem;">
      <div>
        <strong>Quality Training & Technology Services Inc.</strong><br/>
        Email: <a href="mailto:info@qtsi.ca">info@qtsi.ca</a><br/>
        Phone: <a href="tel:+17807165372">+1 780-716-5372</a><br/>
        Edmonton, Alberta
      </div>
      <div>
        <strong>Legal</strong><br/>
        <a href="/privacy.html">Privacy Policy</a><br/>
        <a href="/terms.html">Terms of Use</a>
      </div>
    </div>
  </footer>
`;

files.forEach(f => {
  let html = fs.readFileSync(f, 'utf8');
  
  // Replace #booking with data-action
  html = html.replace(/href="\/#booking"/g, 'href="https://calendly.com/qtsi-info/30min" data-action="booking"');
  html = html.replace(/href="#booking"/g, 'href="https://calendly.com/qtsi-info/30min" data-action="booking"');
  
  // Replace #contact with data-action
  html = html.replace(/href="\/#contact"/g, 'href="mailto:info@qtsi.ca" data-action="contact"');
  html = html.replace(/href="#contact"/g, 'href="mailto:info@qtsi.ca" data-action="contact"');
  
  // Inject SEO metadata before </head>
  if (!html.includes('<meta property="og:title"')) {
    html = html.replace('</head>', seoMetadata(f) + '\n</head>');
  }
  
  // Inject fallback footer before <script type="module" src="/main.js">
  if (!html.includes('class="exec-footer-fallback"')) {
    html = html.replace('<script type="module" src="/main.js">', fallbackFooter + '\n  <script type="module" src="/main.js">');
  }

  fs.writeFileSync(f, html);
});

console.log('Progressive enhancement, SEO, and CTAs applied.');
