/**
 * QTSI Executive Command Center™
 * Client-side JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  const pageType = document.body.getAttribute('data-exec-page');

  if (pageType === 'login') {
    initLogin();
  } else {
    initDashboard();
    if (pageType === 'module') {
      initModuleInteractions();
    }
  }
});

/**
 * 1. Login Logic
 */
function initLogin() {
  const form = document.getElementById('exec-login-form');
  const errorMsg = document.getElementById('exec-login-error');
  const btn = document.getElementById('exec-login-btn');
  const btnText = btn.querySelector('.exec-login-btn-text');
  const btnLoader = btn.querySelector('.exec-login-btn-loader');
  const toggleBtn = document.querySelector('.exec-login-toggle');
  const passwordInput = document.getElementById('exec-password');

  // Toggle password visibility
  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      toggleBtn.textContent = type === 'password' ? '👁' : '👁‍🗨';
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const password = passwordInput.value;
      if (!password) return;

      // Loading state
      btn.classList.add('is-loading');
      btnText.hidden = true;
      btnLoader.hidden = false;
      errorMsg.hidden = true;
      
      try {
        const res = await fetch('/api/exec-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password })
        });
        
        if (res.ok) {
          // Success, redirect to dashboard
          window.location.href = '/executive/';
        } else {
          // Error
          errorMsg.hidden = false;
          passwordInput.value = '';
          passwordInput.focus();
        }
      } catch (err) {
        errorMsg.hidden = false;
        errorMsg.textContent = 'Connection error. Please try again.';
      } finally {
        btn.classList.remove('is-loading');
        btnText.hidden = false;
        btnLoader.hidden = true;
      }
    });
  }
}

/**
 * 2. Dashboard Logic
 */
function initDashboard() {
  // Greeting based on time of day
  const greetingEl = document.querySelector('.exec-greeting-text');
  if (greetingEl) {
    const hour = new Date().getHours();
    let greeting = 'Good Evening, Manav.';
    if (hour >= 5 && hour < 12) greeting = 'Good Morning, Manav.';
    else if (hour >= 12 && hour < 17) greeting = 'Good Afternoon, Manav.';
    greetingEl.textContent = greeting;
  }

  // Update date
  const dateEl = document.querySelector('.exec-brief-date');
  if (dateEl) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = new Date().toLocaleDateString('en-US', options);
  }

  // Countdown Timers
  document.querySelectorAll('[data-deadline]').forEach(el => {
    const deadline = new Date(el.getAttribute('data-deadline'));
    const now = new Date();
    const diffTime = deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      el.textContent = `${diffDays} days`;
      if (diffDays < 30) {
        el.classList.add('exec-priority-badge--urgent');
      } else if (diffDays < 90) {
        el.classList.add('exec-priority-badge--action');
      } else {
        el.classList.add('exec-priority-badge--ready');
      }
    } else {
      el.textContent = 'Deadline Passed';
      el.classList.add('exec-priority-badge--urgent');
    }
  });

  // Logout
  const logoutBtn = document.getElementById('exec-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await fetch('/api/exec-auth', { method: 'DELETE' });
        window.location.href = '/executive/login';
      } catch (e) {
        console.error('Logout failed', e);
      }
    });
  }

  // Global Search Setup
  initGlobalSearch();

  // Corporate Data Room Engine
  initCorporateDataRoom();
}

/**
 * 3. Module Specific Interactions
 */
function initModuleInteractions() {
  // Accordion Logic
  const headers = document.querySelectorAll('.exec-accordion-header');
  headers.forEach(header => {
    header.addEventListener('click', () => {
      const expanded = header.getAttribute('aria-expanded') === 'true';
      
      // Optional: Close all others
      headers.forEach(h => {
        h.setAttribute('aria-expanded', 'false');
        h.nextElementSibling.style.maxHeight = null;
      });

      if (!expanded) {
        header.setAttribute('aria-expanded', 'true');
        const body = header.nextElementSibling;
        body.style.maxHeight = body.scrollHeight + "px";
        
        // Recalculate max-height after a slight delay in case inner content expands
        setTimeout(() => {
            if(header.getAttribute('aria-expanded') === 'true') {
                body.style.maxHeight = body.scrollHeight + 500 + "px"; // padding for tab switches
            }
        }, 300);
      }
    });
  });

  // Tab Logic
  const tabs = document.querySelectorAll('.exec-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      // Find parent container
      const container = e.target.closest('.exec-accordion-body');
      if (!container) return;
      
      // Deactivate all in this container
      container.querySelectorAll('.exec-tab').forEach(t => t.classList.remove('exec-tab--active'));
      container.querySelectorAll('.exec-tab-panel').forEach(p => p.classList.remove('exec-tab-panel--active'));
      
      // Activate clicked
      tab.classList.add('exec-tab--active');
      const target = container.querySelector(tab.dataset.tab);
      if (target) target.classList.add('exec-tab-panel--active');
      
      // Adjust accordion height
      const body = tab.closest('.exec-accordion-body');
      if (body) body.style.maxHeight = body.scrollHeight + 200 + "px";
    });
  });

  // Progress Bar Animation
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const val = bar.getAttribute('data-value');
        if (val) {
          bar.style.width = val + '%';
        }
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.exec-progress-fill').forEach(bar => {
    observer.observe(bar);
  });

  // Sidebar Active State
  const sections = document.querySelectorAll('.exec-section');
  const sidebarLinks = document.querySelectorAll('.exec-sidebar-link');
  
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
        const id = entry.target.id;
        sidebarLinks.forEach(link => {
          link.classList.remove('exec-sidebar-link--active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('exec-sidebar-link--active');
          }
        });
      }
    });
  }, { rootMargin: '-10% 0px -80% 0px' });
  
  sections.forEach(sec => sectionObserver.observe(sec));

  // Click-to-copy
  document.querySelectorAll('.exec-copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.getAttribute('data-copy');
      navigator.clipboard.writeText(text).then(() => {
        const originalText = btn.innerHTML;
        btn.innerHTML = '✅ Copied!';
        setTimeout(() => btn.innerHTML = originalText, 2000);
      });
    });
  });
}

/**
 * Global Search Implementation
 */
function initGlobalSearch() {
  const searchInputs = [
    document.getElementById('exec-search-input'),
    document.getElementById('exec-search-input-overlay')
  ];
  
  const overlay = document.getElementById('exec-search-overlay');
  const resultsContainer = document.getElementById('exec-search-results');
  if (!overlay || !resultsContainer) return;

  // Build index
  const index = [];
  document.querySelectorAll('[data-searchable]').forEach(el => {
    index.push({
      element: el,
      text: el.textContent.toLowerCase(),
      section: el.getAttribute('data-search-section') || 'Content',
      html: el.innerHTML,
      id: el.id
    });
  });

  // Open overlay on input click/focus
  searchInputs.forEach(input => {
    if(input) {
      input.addEventListener('focus', () => {
        overlay.hidden = false;
        const mainInput = document.getElementById('exec-search-input-overlay');
        mainInput.focus();
        mainInput.value = input.value;
        performSearch(input.value);
      });
    }
  });

  // Keyboard shortcut Ctrl+K
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      overlay.hidden = false;
      document.getElementById('exec-search-input-overlay').focus();
    }
    if (e.key === 'Escape' && !overlay.hidden) {
      overlay.hidden = true;
    }
  });

  // Close on backdrop click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.hidden = true;
  });

  // Search logic
  const overlayInput = document.getElementById('exec-search-input-overlay');
  if(overlayInput) {
    overlayInput.addEventListener('input', (e) => performSearch(e.target.value));
  }

  function performSearch(query) {
    resultsContainer.innerHTML = '';
    query = query.toLowerCase().trim();
    if (!query) return;

    let count = 0;
    index.forEach(item => {
      if (item.text.includes(query) && count < 20) {
        count++;
        // Create snippet
        const textStr = item.element.textContent;
        const idx = textStr.toLowerCase().indexOf(query);
        const start = Math.max(0, idx - 40);
        const end = Math.min(textStr.length, idx + query.length + 40);
        let snippet = textStr.substring(start, end);
        
        // Highlight
        const regex = new RegExp(`(${query})`, 'gi');
        snippet = snippet.replace(regex, '<span class="exec-search-highlight">$1</span>');

        const resultEl = document.createElement('div');
        resultEl.className = 'exec-search-item';
        resultEl.innerHTML = `
          <div class="exec-search-item-section">${item.section}</div>
          <div class="exec-search-item-text">...${snippet}...</div>
        `;
        
        resultEl.addEventListener('click', () => {
          overlay.hidden = true;
          // Scroll to element
          item.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Highlight
          item.element.style.transition = 'background 0.5s';
          item.element.style.background = 'rgba(0,112,243,0.2)';
          setTimeout(() => item.element.style.background = '', 1500);
          
          // Expand accordion if inside one
          const accordionBody = item.element.closest('.exec-accordion-body');
          if (accordionBody) {
             const header = accordionBody.previousElementSibling;
             if (header && header.getAttribute('aria-expanded') === 'false') {
                 header.click();
             }
          }
        });
        
        resultsContainer.appendChild(resultEl);
      }
    });
    
    if (count === 0) {
      resultsContainer.innerHTML = '<div class="exec-search-item"><div class="exec-search-item-text">No results found.</div></div>';
    }
  }
}
