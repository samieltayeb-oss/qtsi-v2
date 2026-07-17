import './style.css';
import { injectGlobalFooter } from './src/footer.js';
import { initBooking } from './src/booking.js';
import { initLeadModal } from './src/lead-modal.js';
import { initAnalytics } from './src/analytics.js';

import { initMobileNav } from './src/nav.js';

function init() {
  // 1. Initialize Analytics (GA4)
  initAnalytics();
  
  // 2. Inject Global Footer & Fallback
  injectGlobalFooter();
  
  // 3. Initialize Modals & Popups
  initBooking();
  initLeadModal();
  initMobileNav();

  // 4. Fade Up Intersection Observer
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  document.querySelectorAll('.fade-up').forEach(el => {
    observer.observe(el);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
