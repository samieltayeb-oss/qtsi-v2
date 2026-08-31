/**
 * QTSI Executive Discovery Package
 * Local-storage driven multi-step questionnaire and SMART Output generator.
 */

document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'qtsi_founder_discovery_v1';
  const form = document.getElementById('discovery-form');
  const steps = document.querySelectorAll('.discovery-step');
  const btnNext = document.getElementById('btn-next');
  const btnPrev = document.getElementById('btn-prev');
  const progressText = document.getElementById('progress-text');
  const progressFill = document.getElementById('progress-fill');
  const autosaveToast = document.getElementById('autosave-toast');
  const autosaveStatus = document.getElementById('autosave-status');
  
  const questionnaireView = document.getElementById('questionnaire-view');
  const resultsView = document.getElementById('results-view');
  const declarationCheckbox = document.getElementById('founder-declaration-checkbox');

  let currentStep = 1;
  const totalSteps = steps.length;
  let saveTimeout;

  // 1. Load existing data
  const loadDraft = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        Object.keys(data).forEach(key => {
          const el = form.elements[key];
          if (el) {
            if (el.type === 'checkbox') {
              el.checked = data[key];
            } else {
              el.value = data[key];
            }
          }
        });
        autosaveStatus.textContent = 'Draft Loaded';
      } catch (e) {
        console.error('Failed to parse draft', e);
      }
    }
  };

  // 2. Save data
  const saveDraft = () => {
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => { data[key] = value; });
    data['founder-declaration'] = declarationCheckbox.checked;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    
    autosaveStatus.textContent = 'Saved just now';
    autosaveToast.classList.add('show');
    setTimeout(() => autosaveToast.classList.remove('show'), 2000);
  };

  // 3. Navigation
  const updateUI = () => {
    steps.forEach(s => s.classList.remove('active'));
    document.querySelector(`.discovery-step[data-step="${currentStep}"]`).classList.add('active');
    
    progressText.textContent = `Section ${currentStep} of ${totalSteps}`;
    const pct = Math.max(8, (currentStep / totalSteps) * 100);
    progressFill.style.width = `${pct}%`;

    btnPrev.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
    
    if (currentStep === totalSteps) {
      btnNext.textContent = 'Generate Executive Brief';
      btnNext.style.background = 'var(--grad-brand)';
    } else {
      btnNext.textContent = 'Continue';
    }
  };

  btnPrev.addEventListener('click', () => {
    if (currentStep > 1) {
      currentStep--;
      updateUI();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  btnNext.addEventListener('click', () => {
    saveDraft();
    
    if (currentStep === totalSteps) {
      if (!declarationCheckbox.checked) {
        alert("Please confirm the Founder Declaration before generating the Executive Brief.");
        return;
      }
      generateSmartOutput();
    } else {
      currentStep++;
      updateUI();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  // 4. Auto-save on input change
  form.addEventListener('input', () => {
    autosaveStatus.textContent = 'Saving...';
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveDraft, 1000);
  });

  // 5. Readiness Scoring Logic
  const calculateReadiness = (data) => {
    let founder = 0;
    let product = 0;
    let comm = 0;
    let fin = 0;
    let evid = 0;

    // Founder: Length of vision answers + team
    if (data.q1_problem?.length > 20) founder += 30;
    if (data.q1_why?.length > 20) founder += 30;
    if (data.q7_team?.length > 20) founder += 30;
    founder = Math.min(100, founder + 10); // Base 10

    // Product: Description + architecture
    if (data.q2_building?.length > 20) product += 30;
    if (data.q2_ip?.length > 20) product += 40;
    if (data.q3_delivery?.length > 20) product += 30;

    // Commercialization: Revenue model + GTM
    if (data.q5_revenue?.length > 20) comm += 50;
    if (data.q5_gtm?.length > 20) comm += 50;

    // Financial
    if (data.q6_revenue && data.q6_revenue !== 'Pre-revenue') fin += 40;
    if (data.q6_use_funds?.length > 20) fin += 30;
    if (data.asset_financial_model === 'Completed') fin += 30;

    // Evidence
    let missingAssets = [];
    let completedAssets = 0;
    const assets = [
      { key: 'asset_business_plan', label: 'Business Plan' },
      { key: 'asset_pitch_deck', label: 'Pitch Deck' },
      { key: 'asset_financial_model', label: '3-Year Financial Model' },
      { key: 'asset_curriculum', label: 'Curriculum Outline' },
      { key: 'asset_loi', label: 'Employer LOIs' },
      { key: 'asset_advisory', label: 'Advisory Board' }
    ];

    assets.forEach(a => {
      if (data[a.key] === 'Completed') {
        completedAssets++;
        evid += 16;
      } else {
        missingAssets.push(a.label);
      }
    });
    
    if (data.q4_evidence?.length > 20) evid += 10;
    evid = Math.min(100, Math.round(evid));

    // Overall
    const overall = Math.round((founder + product + comm + fin + evid) / 5);

    return { founder, product, comm, fin, evid, overall, missingAssets };
  };

  // 6. Generate SMART OUTPUT
  const generateSmartOutput = () => {
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => { data[key] = value; });

    const scores = calculateReadiness(data);

    // Populate Scores
    document.getElementById('res-score-founder').textContent = `${scores.founder}%`;
    document.getElementById('res-score-product').textContent = `${scores.product}%`;
    document.getElementById('res-score-comm').textContent = `${scores.comm}%`;
    document.getElementById('res-score-fin').textContent = `${scores.fin}%`;
    document.getElementById('res-score-evid').textContent = `${scores.evid}%`;
    document.getElementById('res-score-overall').textContent = `${scores.overall}%`;

    // Priority Action logic
    let highestPriority = 'Complete Missing Assets';
    if (data.asset_loi !== 'Completed') {
      highestPriority = 'Obtain Employer LOIs (Estimated Impact: +15%)';
    } else if (data.asset_financial_model !== 'Completed') {
      highestPriority = 'Build 3-Year Financial Model (Estimated Impact: +12%)';
    } else if (scores.product < 50) {
      highestPriority = 'Define Proprietary Technical Architecture';
    }
    document.getElementById('res-highest-priority').textContent = highestPriority;

    // Missing Evidence List
    const missingList = document.getElementById('res-missing-evidence');
    missingList.innerHTML = '';
    if (scores.missingAssets.length === 0) {
      missingList.innerHTML = '<li>All core assets completed.</li>';
    } else {
      scores.missingAssets.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>Missing:</strong> ${item}`;
        missingList.appendChild(li);
      });
    }

    // Populate Brief
    const fallback = '<em>Awaiting founder input...</em>';
    
    document.getElementById('brief-vision').innerHTML = `
      <p><strong>The Problem:</strong> ${data.q1_problem || fallback}</p>
      <p><strong>The Ambition:</strong> ${data.q1_ambition || fallback}</p>
      <p><strong>Success Milestone (24mo):</strong> ${data.q11_milestone || fallback}</p>
    `;

    document.getElementById('brief-innovation').innerHTML = `
      <p><strong>Product Architecture:</strong> ${data.q2_building || fallback}</p>
      <p><strong>Proprietary IP:</strong> ${data.q2_ip || fallback}</p>
      <p><strong>Competitive Advantage:</strong> ${data.q2_diff || fallback}</p>
    `;

    document.getElementById('brief-market').innerHTML = `
      <p><strong>Target Market:</strong> ${data.q3_employers ? `Employers: ${data.q3_employers}` : fallback}</p>
      <p><strong>Revenue Model:</strong> ${data.q5_revenue || fallback}</p>
      <p><strong>Traction Evidence:</strong> ${data.q4_evidence || fallback}</p>
    `;

    document.getElementById('brief-funding').innerHTML = `
      <p><strong>Capital Required:</strong> ${data.q9_capital || fallback}</p>
      <p><strong>Preferred Mix:</strong> ${data.q9_mix || fallback}</p>
      <p><strong>Use of Funds:</strong> ${data.q6_use_funds || fallback}</p>
    `;

    // Swap views
    questionnaireView.style.display = 'none';
    resultsView.classList.add('active');
    window.scrollTo(0, 0);
  };

  // Initialize
  loadDraft();
  updateUI();
});
