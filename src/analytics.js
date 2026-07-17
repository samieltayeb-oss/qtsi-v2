import { SITE_CONFIG } from './config.js';

export function initAnalytics() {
  if (window.QTSI_GA_INITIALIZED) return;
  window.QTSI_GA_INITIALIZED = true;

  // Inject GA4 script
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${SITE_CONFIG.ga4Id}`;
  script.async = true;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', SITE_CONFIG.ga4Id);

  // Expose a global helper for our forms and booking scripts
  window.QTSI_GA = function(action, category, label = null) {
    gtag('event', action, {
      event_category: category,
      event_label: label,
      source_page: window.location.pathname
    });
  };
}
