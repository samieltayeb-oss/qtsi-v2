import { SITE_CONFIG } from './config.js';

export function initLeadModal() {
  const modalHtml = `
    <div id="qtsi-lead-modal" class="qtsi-modal-overlay" style="display: none;" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="qtsi-modal-container">
        <button id="qtsi-modal-close" class="qtsi-modal-close" aria-label="Close modal">&times;</button>
        <img src="/qtsi-logo.png" alt="QTSI Logo" style="height: 64px; max-width: 100%; object-fit: contain; margin-bottom: var(--sp-6); display: block;" />
        <h2 id="modal-title" style="margin-top: 0; margin-bottom: var(--sp-2);">Contact QTSI</h2>
        <p style="color: var(--text-secondary); margin-bottom: var(--sp-6);">Please provide your details below and an executive advisor will respond within 1 business day.</p>
        
        <form id="qtsi-lead-form">
          <!-- Honeypot -->
          <input type="text" name="_gotcha" style="display: none;" tabindex="-1" autocomplete="off" />
          
          <input type="hidden" name="source" value="V2 Website Modal" />
          
          <div class="form-group">
            <label for="lead-name">Full Name *</label>
            <input type="text" id="lead-name" name="name" autocomplete="name" required />
          </div>
          
          <div class="form-group">
            <label for="lead-email">Business Email *</label>
            <input type="email" id="lead-email" name="email" autocomplete="email" required />
          </div>
          
          <div class="form-group">
            <label for="lead-company">Company</label>
            <input type="text" id="lead-company" name="company" autocomplete="organization" />
          </div>
          
          <div class="form-group">
            <label for="lead-service">Area of Interest</label>
            <select id="lead-service" name="service">
              <option value="">Select an area...</option>
              <option value="AI Governance">AI Governance</option>
              <option value="Executive Advisory">Executive Advisory</option>
              <option value="Workforce Enablement">Workforce Enablement</option>
              <option value="Procurement">Procurement</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="lead-message">Message</label>
            <textarea id="lead-message" name="message" rows="4"></textarea>
          </div>
          
          <div class="form-group checkbox-group" style="display: flex; gap: var(--sp-2); align-items: flex-start;">
            <input type="checkbox" id="lead-consent" name="consent" required style="margin-top: 4px;" />
            <label for="lead-consent" style="font-size: 0.875rem; color: var(--text-secondary);">
              I consent to QTSI collecting my information in accordance with the <a href="${SITE_CONFIG.legal.privacy}" target="_blank">Privacy Policy</a>. *
            </label>
          </div>
          
          <div id="qtsi-form-error" style="display: none; color: #dc2626; margin-bottom: var(--sp-4); font-size: 0.875rem;"></div>
          
          <button type="submit" id="qtsi-submit-btn" class="exec-button exec-button--primary" style="width: 100%;">Submit Inquiry</button>
        </form>
        
        <div id="qtsi-form-success" style="display: none; text-align: center; padding: var(--sp-8) 0;">
          <h3 style="color: var(--accent-primary); margin-bottom: var(--sp-4);">Inquiry Submitted</h3>
          <p>Thank you. An executive advisor will be in touch with you shortly.</p>
          <button id="qtsi-success-close" class="exec-button exec-button--secondary" style="margin-top: var(--sp-6);">Close</button>
        </div>
      </div>
    </div>
  `;
  
  // Inject CSS
  const style = document.createElement('style');
  style.textContent = `
    .qtsi-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 1rem; }
    .qtsi-modal-container { background: white; border-radius: var(--r-lg); width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; padding: var(--sp-8); position: relative; box-shadow: var(--shadow-lg); }
    .qtsi-modal-close { position: absolute; top: var(--sp-4); right: var(--sp-4); background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-secondary); }
    .form-group { margin-bottom: var(--sp-4); }
    .form-group label { display: block; margin-bottom: var(--sp-2); font-size: 0.875rem; font-weight: 600; }
    .form-group input, .form-group select, .form-group textarea { width: 100%; padding: var(--sp-3); border: 1px solid var(--border-light); border-radius: var(--r-md); font-family: inherit; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: 2px solid var(--accent-primary); border-color: transparent; }
  `;
  document.head.appendChild(style);
  
  // Inject DOM
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  
  const modal = document.getElementById('qtsi-lead-modal');
  const form = document.getElementById('qtsi-lead-form');
  const errorDiv = document.getElementById('qtsi-form-error');
  const successDiv = document.getElementById('qtsi-form-success');
  const submitBtn = document.getElementById('qtsi-submit-btn');
  let lastFocusedElement;

  function openModal() {
    lastFocusedElement = document.activeElement;
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    document.getElementById('lead-name').focus();
  }

  function closeModal() {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (lastFocusedElement) lastFocusedElement.focus();
    
    // Reset form state on close
    setTimeout(() => {
      form.style.display = 'block';
      successDiv.style.display = 'none';
      form.reset();
      errorDiv.style.display = 'none';
    }, 300);
  }

  // Intercept data-action="contact"
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-action="contact"]');
    if (!trigger) return;
    e.preventDefault();
    
    // Clear previous dynamic hidden inputs
    form.querySelectorAll('.dynamic-metadata').forEach(el => el.remove());
    
    // Set dynamic modal title based on button text
    const titleEl = document.getElementById('modal-title');
    if (titleEl && trigger.textContent.trim()) {
      titleEl.textContent = trigger.textContent.trim();
    }
    
    // Default dynamic metadata
    const metadata = {
      Source_Page: window.location.pathname,
      Timestamp: new Date().toISOString()
    };
    
    // Parse custom metadata from trigger if it exists
    if (trigger.dataset.metadata) {
      try {
        const customData = JSON.parse(trigger.dataset.metadata);
        Object.assign(metadata, customData);
      } catch (err) {
        console.warn('Invalid JSON in data-metadata attribute', err);
      }
    }
    
    // If Service is provided, auto-select it in the dropdown
    if (metadata.Service) {
      const select = document.getElementById('lead-service');
      if (select) {
         let option = Array.from(select.options).find(opt => opt.value === metadata.Service);
         if (!option) {
           option = document.createElement('option');
           option.value = metadata.Service;
           option.textContent = metadata.Service;
           select.appendChild(option);
         }
         select.value = metadata.Service;
      }
    }
    
    // Inject hidden fields for all metadata
    for (const [key, value] of Object.entries(metadata)) {
       const input = document.createElement('input');
       input.type = 'hidden';
       input.name = key; // Use exact key for rich CRM segmentation
       input.value = value;
       input.className = 'dynamic-metadata';
       form.appendChild(input);
    }

    openModal();
  });

  document.getElementById('qtsi-modal-close').addEventListener('click', closeModal);
  document.getElementById('qtsi-success-close').addEventListener('click', closeModal);

  // Close on escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      closeModal();
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (submitBtn.disabled) return;
    
    errorDiv.style.display = 'none';
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    try {
      // Pointing to V1 api location
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) throw new Error('Network response was not ok');
      const result = await res.json();
      
      if (result.ok) {
        form.style.display = 'none';
        successDiv.style.display = 'block';
        if (window.QTSI_GA) window.QTSI_GA('event', 'contact_submitted');
      } else {
        throw new Error(result.error || 'Submission failed');
      }
    } catch (err) {
      errorDiv.textContent = 'Unable to submit your inquiry. Please try again or email us directly.';
      errorDiv.style.display = 'block';
      console.error('Lead submit error:', err);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}
