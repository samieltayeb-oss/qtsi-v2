import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        academy: resolve(__dirname, 'academy.html'),
        aigovernance: resolve(__dirname, 'ai-governance.html'),
        executiveadvisory: resolve(__dirname, 'executive-advisory.html'),
        procurement: resolve(__dirname, 'procurement.html'),
        procurementquote: resolve(__dirname, 'procurement-quote.html'),
        contact: resolve(__dirname, 'contact.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        terms: resolve(__dirname, 'terms.html'),
        assessment: resolve(__dirname, 'ai-governance-assessment.html'),
        employers: resolve(__dirname, 'academy/employers.html'),
        partners: resolve(__dirname, 'academy/community-partners.html'),
        startups: resolve(__dirname, 'academy/startups.html'),
        newcomers: resolve(__dirname, 'academy/newcomers.html')
      }
    },
    // Enforce performance budget (Warn if bundle exceeds these limits)
    chunkSizeWarningLimit: 150, // 150 KB JS limit
  }
});
