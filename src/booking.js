import { SITE_CONFIG } from './config.js';

export function initBooking() {
  // Preload CSS eagerly but don't assume it's ready
  let cssLoaded = false;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://assets.calendly.com/assets/external/widget.css';
  link.onload = () => { cssLoaded = true; };
  document.head.appendChild(link);

  let scriptLoaded = false;

  // Intercept all data-action="booking" links
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-action="booking"]');
    if (!trigger) return;
    
    e.preventDefault();
    openCalendly(trigger.getAttribute('href') || SITE_CONFIG.calendlyUrl);
  });

  function openCalendly(url) {
    if (window.QTSI_GA) {
      window.QTSI_GA('event', 'calendly_popup_opened');
    }

    if (window.Calendly && cssLoaded) {
      window.Calendly.initPopupWidget({ url });
      return;
    }

    // If CSS isn't loaded yet, or script isn't loaded, load it now and wait
    const checkReady = setInterval(() => {
      if (window.Calendly && cssLoaded) {
        clearInterval(checkReady);
        window.Calendly.initPopupWidget({ url });
      }
    }, 100);

    if (!scriptLoaded && !document.querySelector('script[src*="calendly"]')) {
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.onload = () => { scriptLoaded = true; };
      document.body.appendChild(script);
    }
  }
}
