export function initEmbeddedForms() {
  const forms = document.querySelectorAll('.qtsi-embedded-form');
  
  forms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn.disabled) return; // Prevent duplicate submissions
      
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';
      
      // Look for a success/error message container (we will inject these via the HTML cleaner)
      let errorDiv = form.querySelector('.form-error');
      let successDiv = form.parentElement.querySelector('.form-success');
      
      if (errorDiv) errorDiv.style.display = 'none';
      
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      
      // Inject source metadata
      data.source = 'V2 Embedded Form';
      data.Source_Page = window.location.pathname;
      
      try {
        const res = await fetch('/api/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        if (!res.ok) throw new Error('Network response was not ok');
        const result = await res.json();
        
        if (result.ok) {
          form.style.display = 'none';
          if (successDiv) {
            successDiv.style.display = 'block';
          } else {
            // Fallback success UI
            form.insertAdjacentHTML('afterend', '<div class="form-success" style="text-align: center; color: var(--accent-primary); font-weight: 600; margin-top: 1rem;">Inquiry Submitted. Thank you!</div>');
          }
          // Only fire analytics on SUCCESS
          if (window.QTSI_GA) window.QTSI_GA('event', 'contact_submitted');
        } else {
          throw new Error(result.error || 'Submission failed');
        }
      } catch (err) {
        if (errorDiv) {
          errorDiv.textContent = 'Unable to submit your inquiry. Please try again.';
          errorDiv.style.display = 'block';
        } else {
          form.insertAdjacentHTML('afterbegin', '<div class="form-error" style="color: #dc2626; margin-bottom: 1rem; font-size: 0.875rem;">Unable to submit your inquiry. Please try again.</div>');
        }
        console.error('Embedded lead submit error:', err);
        // Re-enable button on error so they can try again
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  });
}
