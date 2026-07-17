export function initMobileNav() {
  const navContainer = document.querySelector('.exec-nav-container');
  if (!navContainer) return;

  // 1. Create Hamburger Button
  const hamburger = document.createElement('button');
  hamburger.className = 'exec-nav-hamburger';
  hamburger.setAttribute('aria-label', 'Toggle menu');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('aria-controls', 'exec-mobile-drawer');
  
  // Minimal elegant SVG lines
  hamburger.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="4" y1="12" x2="20" y2="12" class="line-mid"></line>
      <line x1="4" y1="6" x2="20" y2="6" class="line-top"></line>
      <line x1="4" y1="18" x2="20" y2="18" class="line-bot"></line>
    </svg>
  `;

  // 2. Create Mobile Drawer
  const drawer = document.createElement('div');
  drawer.id = 'exec-mobile-drawer';
  drawer.className = 'exec-nav-drawer';
  drawer.setAttribute('aria-hidden', 'true');

  const drawerContent = document.createElement('div');
  drawerContent.className = 'exec-nav-drawer-content';

  // Clone links from desktop nav
  const desktopLinks = document.querySelectorAll('.exec-nav-links a');
  desktopLinks.forEach(link => {
    const cloned = link.cloneNode(true);
    // Remove custom inline styles to let nav.css handle mobile styling
    cloned.removeAttribute('style');
    cloned.className = cloned.classList.contains('exec-button') 
      ? 'exec-button exec-button--primary mobile-nav-btn' 
      : 'exec-nav-link mobile-nav-link';
    drawerContent.appendChild(cloned);
  });

  drawer.appendChild(drawerContent);
  document.body.appendChild(drawer);
  navContainer.appendChild(hamburger);

  let isOpen = false;

  function toggleMenu() {
    isOpen = !isOpen;
    hamburger.setAttribute('aria-expanded', isOpen.toString());
    drawer.setAttribute('aria-hidden', (!isOpen).toString());
    
    if (isOpen) {
      document.body.classList.add('drawer-open');
      hamburger.classList.add('is-active');
      // Force repaint to trigger animation
      drawer.getBoundingClientRect();
      drawer.classList.add('is-visible');
    } else {
      drawer.classList.remove('is-visible');
      hamburger.classList.remove('is-active');
      
      // Wait for transition before locking body scroll off
      setTimeout(() => {
        if (!isOpen) {
          document.body.classList.remove('drawer-open');
        }
      }, 250); // Matches transitions in CSS
    }
  }

  hamburger.addEventListener('click', toggleMenu);

  // Close menu when clicking links (especially internal or page changes)
  drawerContent.addEventListener('click', (e) => {
    if (e.target.closest('a')) {
      toggleMenu();
    }
  });

  // Close menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      toggleMenu();
    }
  });
}
