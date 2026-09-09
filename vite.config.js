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
        newcomers: resolve(__dirname, 'academy/newcomers.html'),
        gapanalysis: resolve(__dirname, 'professional-gap-analysis.html'),
        enterpriseaudit: resolve(__dirname, 'enterprise-audit.html'),
        execIndex: resolve(__dirname, 'executive/index.html'),
        execLogin: resolve(__dirname, 'executive/login.html'),
        execDiscovery: resolve(__dirname, 'executive/discovery.html'),
        executiveShowcase: resolve(__dirname, 'executive-showcase.html'),
        vaultAdvisoryCharter: resolve(__dirname, 'executive/vault/advisory-board-charter.html'),
        vaultAdvisoryInvite: resolve(__dirname, 'executive/vault/advisory-board-invitation.html'),
        vaultBoardMeeting: resolve(__dirname, 'executive/vault/board-meeting-template.html'),
        vaultCaseStudy: resolve(__dirname, 'executive/vault/case-study-template.html'),
        vaultCommercialization: resolve(__dirname, 'executive/vault/commercialization-plan.html'),
        vaultCurriculumChecklist: resolve(__dirname, 'executive/vault/curriculum-validation-checklist.html'),
        vaultEmployerLOI: resolve(__dirname, 'executive/vault/employer-loi.html'),
        vaultEmployerPartnership: resolve(__dirname, 'executive/vault/employer-partnership-template.html'),
        vaultIrapBrief: resolve(__dirname, 'executive/vault/irap-project-brief.html'),
        vaultNDA: resolve(__dirname, 'executive/vault/nda-template.html'),
        vaultPilotPlan: resolve(__dirname, 'executive/vault/pilot-cohort-plan.html'),
        vaultRegulatoryChecklist: resolve(__dirname, 'executive/vault/regulatory-readiness-checklist.html'),
        vaultSredChecklist: resolve(__dirname, 'executive/vault/sred-technical-checklist.html'),
        vaultStrategicLOI: resolve(__dirname, 'executive/vault/strategic-partner-loi.html'),
        vaultBmc: resolve(__dirname, 'executive/vault/workforce-innovation-bmc.html')
      }
    },
    // Enforce performance budget (Warn if bundle exceeds these limits)
    chunkSizeWarningLimit: 150, // 150 KB JS limit
  }
});
