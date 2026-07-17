import { SITE_CONFIG } from './config.js';

export function injectGlobalFooter() {
  const footerContainer = document.querySelector('footer.exec-footer-fallback') || document.createElement('footer');
  if (!footerContainer.classList.contains('exec-footer-fallback')) {
    footerContainer.classList.add('exec-footer-fallback');
    document.body.appendChild(footerContainer);
  }
  
  // Upgrade to enhanced footer class
  footerContainer.className = 'exec-footer';
  
  const currentYear = new Date().getFullYear();
  
  footerContainer.innerHTML = `
    <div class="container flex" style="flex-wrap: wrap; gap: var(--sp-12); padding: var(--sp-16) 0; border-top: 1px solid var(--border-light);">
      
      <div style="flex: 2; min-width: 250px;">
        <img src="/qtsi-logo.png" alt="QTSI Logo" style="height: 64px; max-width: 100%; object-fit: contain; margin-bottom: var(--sp-6);" />
        <p class="text-body" style="margin-bottom: var(--sp-4); color: var(--text-secondary);">
          Executive Cyber Advisory, AI Governance, and Enterprise Workforce Enablement.
        </p>
      </div>

      <div style="flex: 1; min-width: 150px;">
        <h4 style="font-weight: 700; margin-bottom: var(--sp-4);">Contact</h4>
        <ul style="list-style: none; padding: 0; margin: 0; color: var(--text-secondary); line-height: 2;">
          <li><a href="mailto:${SITE_CONFIG.email}" style="color: inherit; text-decoration: none;" data-action="contact">${SITE_CONFIG.email}</a></li>
          <li><a href="tel:${SITE_CONFIG.phone.replace(/[^0-9+]/g, '')}" style="color: inherit; text-decoration: none;">${SITE_CONFIG.phone}</a></li>
          <li>${SITE_CONFIG.location}</li>
        </ul>
      </div>

      <div style="flex: 1; min-width: 150px;">
        <h4 style="font-weight: 700; margin-bottom: var(--sp-4);">Services</h4>
        <ul style="list-style: none; padding: 0; margin: 0; color: var(--text-secondary); line-height: 2;">
          <li><a href="/ai-governance.html" style="color: inherit; text-decoration: none;">AI Governance</a></li>
          <li><a href="/executive-advisory.html" style="color: inherit; text-decoration: none;">Executive Advisory</a></li>
          <li><a href="/academy.html" style="color: inherit; text-decoration: none;">Workforce Enablement</a></li>
        </ul>
      </div>

      <div style="flex: 1; min-width: 150px;">
        <h4 style="font-weight: 700; margin-bottom: var(--sp-4);">Legal</h4>
        <ul style="list-style: none; padding: 0; margin: 0; color: var(--text-secondary); line-height: 2;">
          <li><a href="${SITE_CONFIG.legal.privacy}" style="color: inherit; text-decoration: none;">Privacy Policy</a></li>
          <li><a href="${SITE_CONFIG.legal.terms}" style="color: inherit; text-decoration: none;">Terms of Use</a></li>
        </ul>
      </div>
      
    </div>
    <div class="container" style="padding-bottom: var(--sp-8); border-top: 1px solid var(--border-light); padding-top: var(--sp-8); display: flex; justify-content: space-between; color: var(--text-tertiary); font-size: 0.875rem;">
      <span>&copy; ${currentYear} ${SITE_CONFIG.companyName}. All rights reserved.</span>
      <a href="${SITE_CONFIG.socials.linkedin}" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: none;">LinkedIn</a>
    </div>
  `;
}
