/* ═══════════════════════════════════════════════════════════════
   js/assessment.js — QTSI AI Governance Readiness Assessment
   Phase 1: Landing · Context Capture · 25-Question Diagnostic Engine
═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Category definitions ─────────────────────────────────── */
  var CATEGORIES = [
    {
      id: 'governance',
      label: 'Governance',
      num: 1,
      color: '#3B82F6',
      desc: 'Evaluates whether your organization has the structural foundation — policies, ownership, and accountability — to govern AI responsibly.',
      icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
    },
    {
      id: 'security',
      label: 'Security',
      num: 2,
      color: '#EF4444',
      desc: 'Assesses how well your organization protects AI systems, models, data pipelines, and outputs from misuse, manipulation, and breach.',
      icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    },
    {
      id: 'compliance',
      label: 'Compliance',
      num: 3,
      color: '#F59E0B',
      desc: 'Measures your readiness to meet current and emerging AI-specific regulations including the EU AI Act, Canada\'s AIDA, and sector-specific obligations.',
      icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
    },
    {
      id: 'operations',
      label: 'Operations',
      num: 4,
      color: '#22C55E',
      desc: 'Probes the maturity of your AI deployment practices — from vendor management and model performance monitoring to incident response.',
      icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M22 12h-2M4 12H2M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M12 22v-2M12 4V2"/></svg>',
    },
    {
      id: 'leadership',
      label: 'Leadership',
      num: 5,
      color: '#C9A84C',
      desc: 'Gauges executive and board-level engagement: whether AI governance is a strategic priority with dedicated resources and visible sponsorship.',
      icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    },
  ];

  /* ── Question bank — 25 questions, 5 per category ─────────── */
  var QUESTIONS = [
    /* ── Governance (0–4) ── */
    {
      cat: 'governance',
      text: 'Does your organization have a documented AI Governance Policy approved at the executive or board level?',
      answers: [
        'No policy exists and there are no plans to create one.',
        'A policy is being drafted but has not been approved.',
        'An approved policy exists but is not actively enforced.',
        'An enforced policy exists with defined roles and accountability.',
        'A formally governed, regularly reviewed policy is embedded in enterprise risk management.',
      ],
    },
    {
      cat: 'governance',
      text: 'Is there a designated AI governance owner, committee, or function with a formal mandate?',
      answers: [
        'No designated owner — AI governance is handled ad hoc.',
        'Informally assigned to an existing role without a formal mandate.',
        'A designated role exists but lacks decision-making authority.',
        'A formal role or working group exists with a defined scope.',
        'An executive-level governance body with board visibility and clear authority.',
      ],
    },
    {
      cat: 'governance',
      text: 'How does your organization manage the inventory of AI systems and models currently in use?',
      answers: [
        'No inventory exists — AI tools are adopted without central tracking.',
        'Informal awareness of some tools, but no formal registry.',
        'A partial registry exists for major systems only.',
        'A maintained inventory covers most AI tools with ownership noted.',
        'A comprehensive registry includes ownership, risk classification, and review cadence.',
      ],
    },
    {
      cat: 'governance',
      text: 'How are AI-related risks surfaced and escalated within your governance structure?',
      answers: [
        'AI risks are not formally identified or tracked.',
        'Risks are raised informally on an ad hoc basis.',
        'Some AI risks are captured in a risk register but rarely reviewed.',
        'AI risks are formally logged, reviewed, and assigned to owners.',
        'AI risk management is integrated into the enterprise risk management framework with regular board reporting.',
      ],
    },
    {
      cat: 'governance',
      text: 'Does your organization conduct AI impact assessments before deploying new AI systems or making significant changes to existing ones?',
      answers: [
        'No impact assessments are conducted.',
        'Assessments happen occasionally but are not standardized.',
        'A template exists but is applied inconsistently.',
        'Structured assessments are conducted before major deployments.',
        'Mandatory impact assessments with documented outcomes and sign-off for all AI deployments.',
      ],
    },
    /* ── Security (5–9) ── */
    {
      cat: 'security',
      text: 'Has your organization assessed the specific security risks introduced by AI systems — such as prompt injection, model inversion, or adversarial inputs?',
      answers: [
        'No AI-specific security assessments have been conducted.',
        'Basic awareness exists but no formal assessment has occurred.',
        'Some AI risks have been identified but not formally addressed.',
        'AI-specific risks are included in security assessments and have defined controls.',
        'Ongoing AI security testing program with documented controls and review cycles.',
      ],
    },
    {
      cat: 'security',
      text: 'How does your organization control access to AI systems and the sensitive data they process?',
      answers: [
        'Access to AI systems is not controlled beyond standard IT permissions.',
        'Basic access controls exist but are not AI-specific.',
        'Role-based access is applied to most AI systems with some data segregation.',
        'Formal access control policies govern AI systems with least-privilege enforcement.',
        'Comprehensive access governance including privileged access management, audit logging, and periodic recertification.',
      ],
    },
    {
      cat: 'security',
      text: 'Are the data pipelines feeding your AI systems protected from unauthorized access, poisoning, or manipulation?',
      answers: [
        'Data pipelines have no specific protections beyond general IT security.',
        'Some pipelines are protected but coverage is inconsistent.',
        'Key pipelines are protected with basic controls and monitoring.',
        'Data integrity controls and anomaly detection are applied across major pipelines.',
        'Full pipeline security program including integrity validation, provenance tracking, and automated anomaly response.',
      ],
    },
    {
      cat: 'security',
      text: 'Does your incident response plan cover AI-specific scenarios such as model compromise, biased output deployment, or AI-generated misinformation?',
      answers: [
        'Incident response plans do not address AI-specific scenarios.',
        'AI scenarios are mentioned informally but not formally documented.',
        'Some AI scenarios are included in existing IR plans.',
        'AI-specific playbooks exist and have been reviewed by the security team.',
        'AI IR playbooks are tested, regularly updated, and integrated with broader enterprise crisis management.',
      ],
    },
    {
      cat: 'security',
      text: 'How does your organization manage third-party AI tools and vendor-provided AI capabilities from a security perspective?',
      answers: [
        'Third-party AI tools are adopted without security review.',
        'Informal reviews occur but there is no standard process.',
        'Security reviews are conducted for major tools but not consistently applied.',
        'A vendor AI security assessment process exists with defined criteria.',
        'Comprehensive third-party AI governance including contractual security requirements, ongoing monitoring, and right-to-audit provisions.',
      ],
    },
    /* ── Compliance (10–14) ── */
    {
      cat: 'compliance',
      text: 'Has your organization mapped its AI systems against applicable regulations — such as Canada\'s AIDA, the EU AI Act, PIPEDA/Bill C-27, or sector-specific rules?',
      answers: [
        'No regulatory mapping has been conducted.',
        'Awareness of regulations exists but no formal mapping has been done.',
        'A partial mapping covers the most prominent regulations.',
        'A structured regulatory mapping covers all known applicable requirements.',
        'Ongoing compliance mapping program with legal review, updated as regulations evolve.',
      ],
    },
    {
      cat: 'compliance',
      text: 'Does your organization have processes to ensure AI systems meet data privacy and consent requirements when processing personal information?',
      answers: [
        'No specific AI privacy controls beyond general data governance.',
        'Privacy is considered informally when deploying AI.',
        'Some AI use cases have privacy assessments but coverage is incomplete.',
        'Privacy impact assessments are conducted for AI systems that process personal data.',
        'Privacy-by-design is embedded in the AI development and procurement lifecycle with documented controls.',
      ],
    },
    {
      cat: 'compliance',
      text: 'How does your organization address algorithmic transparency and explainability for high-stakes AI decisions?',
      answers: [
        'No transparency requirements are applied to AI systems.',
        'Explainability is considered informally for some high-risk use cases.',
        'Documentation of model logic exists for some systems.',
        'Explainability standards are defined and applied to high-stakes AI use cases.',
        'Formal explainability requirements with stakeholder-facing documentation and audit trails for all consequential AI decisions.',
      ],
    },
    {
      cat: 'compliance',
      text: 'Are AI systems that make consequential decisions about individuals (credit, employment, benefits, access) subject to bias testing and fairness review?',
      answers: [
        'No bias testing is conducted on AI decision systems.',
        'Bias is acknowledged as a concern but no formal testing occurs.',
        'Ad hoc testing has been done on some systems.',
        'Formal bias testing protocols are applied before deployment of high-stakes systems.',
        'Continuous fairness monitoring post-deployment with defined remediation processes and documented outcomes.',
      ],
    },
    {
      cat: 'compliance',
      text: 'Does your organization maintain audit trails sufficient to demonstrate compliance with AI governance requirements to regulators or auditors?',
      answers: [
        'No AI-specific audit trails are maintained.',
        'General system logs exist but are not designed for AI governance audits.',
        'Some AI decisions are logged but coverage and retention are inconsistent.',
        'Structured audit logs are maintained for most AI systems with defined retention.',
        'Comprehensive, tamper-evident audit trails support regulatory review, with regular completeness checks.',
      ],
    },
    /* ── Operations (15–19) ── */
    {
      cat: 'operations',
      text: 'Does your organization monitor AI model performance in production — including accuracy, drift, and unexpected output patterns?',
      answers: [
        'No monitoring of AI systems after deployment.',
        'Informal monitoring — issues are reported by users when noticed.',
        'Basic performance dashboards exist for some key systems.',
        'Structured monitoring with defined thresholds and alert mechanisms.',
        'Automated performance monitoring with drift detection, root-cause analysis, and structured remediation workflows.',
      ],
    },
    {
      cat: 'operations',
      text: 'How does your organization manage the full lifecycle of AI models — from development and testing through retirement?',
      answers: [
        'No formal lifecycle management — models are deployed and left running.',
        'Informal practices exist but there is no standardized process.',
        'Basic version control and deployment records are maintained.',
        'A defined model lifecycle process covers development, testing, approval, and deployment.',
        'Mature MLOps / AI lifecycle management with change control, versioning, performance gates, and formal decommissioning.',
      ],
    },
    {
      cat: 'operations',
      text: 'Are employees who interact with or oversee AI systems adequately trained on those systems\' limitations, risks, and governance requirements?',
      answers: [
        'No AI-specific training is provided to employees.',
        'Informal guidance is shared on an ad hoc basis.',
        'General AI awareness training is available but not role-specific.',
        'Role-specific AI training is provided to key personnel with governance obligations.',
        'Ongoing, mandatory training program covering AI risks, ethics, and governance — with completion tracking and refreshes.',
      ],
    },
    {
      cat: 'operations',
      text: 'Does your organization have a process for handling AI-related errors, bias incidents, or harmful outputs reported internally or by customers?',
      answers: [
        'No defined process — issues are handled reactively as they arise.',
        'Issues are logged informally without a structured response.',
        'A basic process exists for major incidents but is not consistently applied.',
        'A defined reporting and triage process covers AI-related incidents.',
        'Formal AI incident management with root-cause analysis, remediation tracking, stakeholder communication, and post-incident review.',
      ],
    },
    {
      cat: 'operations',
      text: 'How does your organization evaluate and manage AI vendor and technology dependencies to ensure continuity and avoid lock-in risk?',
      answers: [
        'Vendor dependencies are not formally managed.',
        'Key vendor relationships are tracked but without governance structure.',
        'Vendor concentration risk is acknowledged and documented for some critical AI tools.',
        'Formal vendor risk assessments cover AI technology dependencies with continuity planning.',
        'Proactive vendor diversification strategy with contractual protections, exit provisions, and continuity testing.',
      ],
    },
    /* ── Leadership (20–24) ── */
    {
      cat: 'leadership',
      text: 'Does your C-suite (CEO, CIO, CISO, or equivalent) treat AI governance as a strategic priority with defined ownership?',
      answers: [
        'AI governance is not on the executive agenda.',
        'Occasional executive interest but no defined ownership.',
        'At least one executive has informal responsibility for AI governance.',
        'A C-suite leader has formal accountability for AI governance outcomes.',
        'AI governance is a standing executive agenda item with a named C-suite sponsor and board reporting.',
      ],
    },
    {
      cat: 'leadership',
      text: 'Has the board of directors received formal briefings on AI risks, opportunities, and governance obligations within the last 12 months?',
      answers: [
        'The board has not received any AI governance briefing.',
        'AI has been mentioned informally at a board meeting.',
        'A general AI briefing has been provided but governance was not a focus.',
        'The board has received a structured briefing covering AI risks and governance responsibilities.',
        'Regular board-level AI governance reporting with defined KPIs, escalation criteria, and board-approved risk appetite.',
      ],
    },
    {
      cat: 'leadership',
      text: 'Does your organization have a dedicated budget or resource allocation for AI governance activities — including compliance, tooling, and staffing?',
      answers: [
        'No dedicated budget — AI governance relies on borrowed resources.',
        'Small ad hoc budget drawn from existing IT or legal funds.',
        'Modest dedicated budget for basic compliance activities.',
        'A defined AI governance budget supports key activities with staffing.',
        'Strategic investment in AI governance with multi-year funding, headcount, and executive sponsorship.',
      ],
    },
    {
      cat: 'leadership',
      text: 'Does your organization have a published or internally documented AI Ethics Principles or Responsible AI Framework?',
      answers: [
        'No ethics principles or responsible AI framework exists.',
        'Informal principles are referenced but not documented.',
        'A framework exists in draft form but has not been formally adopted.',
        'A documented, approved framework guides AI development and procurement decisions.',
        'Published responsible AI framework with active enforcement, training integration, and public or stakeholder disclosure.',
      ],
    },
    {
      cat: 'leadership',
      text: 'How effectively does your organization communicate its AI governance stance to customers, regulators, partners, and the public?',
      answers: [
        'No external communication about AI governance practices.',
        'Reactive responses only — communicated when asked.',
        'Some disclosure exists in privacy policies or terms of service.',
        'Proactive disclosure in annual reports, policies, or dedicated website content.',
        'Comprehensive, proactive AI transparency program with regular updates, stakeholder engagement, and external assurance.',
      ],
    },
  ];

  /* ── Maturity levels ────────────────────────────────────────── */
  var MATURITY = [
    { min: 0,  max: 19, level: 'Reactive',   desc: 'AI governance is largely absent. Significant exposure to regulatory, reputational, and operational risk requires immediate attention.' },
    { min: 20, max: 39, level: 'Aware',       desc: 'Early awareness exists but governance is fragmented and inconsistent. Foundational policies and accountabilities need to be established.' },
    { min: 40, max: 59, level: 'Controlled',  desc: 'Basic governance controls are in place but coverage has gaps. A structured program would strengthen consistency and reduce residual risk.' },
    { min: 60, max: 79, level: 'Governed',    desc: 'A solid governance foundation is established. Opportunities exist to deepen integration, automate monitoring, and formalize board-level oversight.' },
    { min: 80, max: 100, level: 'Optimized',  desc: 'Industry-leading governance posture. Focus should be on continuous improvement, innovation-enabling governance, and external assurance.' },
  ];

  /* ── Storage key ─────────────────────────────────────────────── */
  var STORAGE_KEY = 'qtsi_ag_v1';

  /* ── State ───────────────────────────────────────────────────── */
  var S = {
    phase: 'landing',          // landing | context | intro | question | calculating | done
    currentQ: 0,               // 0-24
    answers: {},               // { 0: 2, 5: 4, ... } value = 0-4
    context: {},               // { size, industry, region, role }
    startedAt: 0,              // timestamp first question was shown
    currentCatIntro: -1,       // which category intro was last shown
  };

  /* ── Helpers ─────────────────────────────────────────────────── */
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function catForQ(idx) {
    return QUESTIONS[idx].cat;
  }

  function catIndex(catId) {
    for (var i = 0; i < CATEGORIES.length; i++) {
      if (CATEGORIES[i].id === catId) return i;
    }
    return 0;
  }

  function firstQOfCat(catId) {
    for (var i = 0; i < QUESTIONS.length; i++) {
      if (QUESTIONS[i].cat === catId) return i;
    }
    return 0;
  }

  function questionsInCat(catId) {
    return QUESTIONS.filter(function (q) { return q.cat === catId; });
  }

  function qNumInCat(idx) {
    var catId = QUESTIONS[idx].cat;
    var num = 0;
    for (var i = 0; i <= idx; i++) {
      if (QUESTIONS[i].cat === catId) num++;
    }
    return num;
  }

  function estimateMinutes() {
    var remaining = QUESTIONS.length - S.currentQ;
    return Math.max(1, Math.ceil(remaining * 0.35));
  }

  /* ── LocalStorage ────────────────────────────────────────────── */
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        v: 1,
        currentQ: S.currentQ,
        answers: S.answers,
        context: S.context,
        startedAt: S.startedAt,
        savedAt: Date.now(),
      }));
    } catch (e) { /* storage unavailable */ }
  }

  function loadSaved() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || data.v !== 1) return null;
      return data;
    } catch (e) { return null; }
  }

  function clearSaved() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
  }

  /* ── Zone switching ──────────────────────────────────────────── */
  function showZone(id) {
    qsa('.ag-zone').forEach(function (z) { z.classList.remove('is-active'); });
    var zone = qs('#' + id);
    if (zone) zone.classList.add('is-active');
  }

  /* ── Update progress UI ──────────────────────────────────────── */
  function updateProgress() {
    var pct = Math.round(((S.currentQ) / QUESTIONS.length) * 100);
    var fill = qs('#ag-global-fill');
    if (fill) fill.style.width = pct + '%';

    var counter = qs('#ag-q-counter');
    if (counter) counter.textContent = 'Question ' + (S.currentQ + 1) + ' of ' + QUESTIONS.length;

    var timeEl = qs('#ag-time-remaining');
    if (timeEl) {
      var mins = estimateMinutes();
      timeEl.textContent = '~' + mins + ' min remaining';
    }

    /* Category pills */
    qsa('.ag-cat-pill').forEach(function (pill) {
      var catId = pill.getAttribute('data-cat');
      pill.classList.remove('is-active', 'is-complete');

      var currentCat = catForQ(S.currentQ);
      var catQs = questionsInCat(catId);
      var catFirstQ = firstQOfCat(catId);
      var catLastQ = catFirstQ + catQs.length - 1;

      if (catId === currentCat) {
        pill.classList.add('is-active');
      } else if (S.currentQ > catLastQ) {
        pill.classList.add('is-complete');
      }
    });
  }

  /* ── Category intro card ─────────────────────────────────────── */
  function showCategoryIntro(catId, onContinue) {
    var cat = CATEGORIES[catIndex(catId)];
    var intro = qs('#ag-cat-intro');
    var qWrap = qs('#ag-question-wrap');

    if (qWrap) qWrap.style.display = 'none';
    if (!intro) { onContinue(); return; }

    intro.setAttribute('data-cat', catId);
    qs('#ag-cat-intro-icon', intro).innerHTML = cat.icon;
    qs('#ag-cat-intro-num', intro).textContent = 'Category ' + cat.num + ' of ' + CATEGORIES.length;
    qs('#ag-cat-intro-name', intro).textContent = cat.label;
    qs('#ag-cat-intro-desc', intro).textContent = cat.desc;

    intro.style.display = '';

    var continueBtn = qs('#ag-cat-intro-continue');
    function proceed() {
      intro.style.display = 'none';
      if (qWrap) qWrap.style.display = '';
      onContinue();
    }
    if (continueBtn) {
      continueBtn.onclick = null;
      continueBtn.onclick = proceed;
    }
  }

  /* ── Build & render a question ───────────────────────────────── */
  function buildQuestion(idx) {
    var q = QUESTIONS[idx];
    var cat = CATEGORIES[catIndex(q.cat)];

    /* Category label + color */
    var catLabel = qs('#ag-q-category');
    if (catLabel) {
      catLabel.innerHTML =
        '<span class="ag-q-cat-dot" style="background:' + cat.color + '"></span>' +
        cat.label;
    }

    /* Q num in category */
    var numLabel = qs('#ag-q-num');
    if (numLabel) {
      var qInCat = questionsInCat(q.cat).length;
      numLabel.textContent = 'Q' + qNumInCat(idx) + ' of ' + qInCat;
    }

    /* Question text */
    var textEl = qs('#ag-q-text');
    if (textEl) textEl.textContent = q.text;

    /* Data attribute on card for CSS category coloring */
    var card = qs('#ag-question-card');
    if (card) card.setAttribute('data-category', q.cat);

    /* Answers */
    var answersEl = qs('#ag-answers');
    if (!answersEl) return;
    answersEl.innerHTML = '';

    var saved = (S.answers[idx] !== undefined) ? S.answers[idx] : -1;

    q.answers.forEach(function (text, val) {
      var btn = document.createElement('button');
      btn.className = 'ag-answer' + (saved === val ? ' is-selected' : '');
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', saved === val ? 'true' : 'false');
      btn.setAttribute('data-val', val);
      btn.setAttribute('type', 'button');
      btn.innerHTML =
        '<span class="ag-answer-radio"><span class="ag-answer-radio-inner"></span></span>' +
        '<span class="ag-answer-text">' + escapeHtml(text) + '</span>' +
        '<span class="ag-answer-value-label" aria-hidden="true">' + val + '/4</span>';

      btn.addEventListener('click', function () {
        selectAnswer(idx, val);
      });
      answersEl.appendChild(btn);
    });

    /* Next button state */
    var nextBtn = qs('#ag-nav-next');
    if (nextBtn) {
      nextBtn.disabled = (saved === -1);
      nextBtn.textContent = (idx === QUESTIONS.length - 1) ? 'Complete Assessment →' : 'Next →';
    }

    /* Back button */
    var backBtn = qs('#ag-nav-back');
    if (backBtn) backBtn.disabled = (idx === 0);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ── Answer selection ────────────────────────────────────────── */
  function selectAnswer(qIdx, val) {
    S.answers[qIdx] = val;
    saveState();

    /* Update answer card states */
    var answersEl = qs('#ag-answers');
    if (answersEl) {
      qsa('.ag-answer', answersEl).forEach(function (btn) {
        var isSelected = (parseInt(btn.getAttribute('data-val'), 10) === val);
        btn.classList.toggle('is-selected', isSelected);
        btn.setAttribute('aria-checked', isSelected ? 'true' : 'false');
      });
    }

    /* Enable next */
    var nextBtn = qs('#ag-nav-next');
    if (nextBtn) nextBtn.disabled = false;
  }

  /* ── Animated question transition ───────────────────────────── */
  function transitionToQuestion(newIdx, direction) {
    var wrap = qs('#ag-question-wrap');
    if (!wrap) { S.currentQ = newIdx; buildQuestion(newIdx); updateProgress(); return; }

    var exitClass = direction === 'back' ? 'ag-exit-bwd' : 'ag-exit-fwd';
    var enterClass = direction === 'back' ? 'ag-enter-bwd' : 'ag-enter-fwd';

    wrap.classList.add(exitClass);

    setTimeout(function () {
      wrap.classList.remove(exitClass);
      wrap.classList.add(enterClass);

      S.currentQ = newIdx;
      buildQuestion(newIdx);
      updateProgress();

      /* Force reflow, then remove enter class to trigger CSS transition to base state */
      wrap.getBoundingClientRect();
      wrap.classList.remove(enterClass);
    }, 220);
  }

  /* ── Navigation ──────────────────────────────────────────────── */
  function goNext() {
    var idx = S.currentQ;
    if (S.answers[idx] === undefined) return; /* no answer selected */

    if (idx === QUESTIONS.length - 1) {
      startCalculating();
      return;
    }

    var nextIdx = idx + 1;
    var currentCat = catForQ(idx);
    var nextCat = catForQ(nextIdx);

    if (nextCat !== currentCat) {
      /* Crossing into a new category — show intro first */
      var wrap = qs('#ag-question-wrap');
      var exitClass = 'ag-exit-fwd';
      if (wrap) wrap.classList.add(exitClass);

      setTimeout(function () {
        if (wrap) { wrap.classList.remove(exitClass); wrap.style.display = 'none'; }
        S.currentQ = nextIdx;
        updateProgress();
        showCategoryIntro(nextCat, function () {
          var qWrap = qs('#ag-question-wrap');
          if (qWrap) {
            qWrap.style.display = '';
            qWrap.classList.add('ag-enter-fwd');
            buildQuestion(nextIdx);
            qWrap.getBoundingClientRect();
            qWrap.classList.remove('ag-enter-fwd');
          } else {
            buildQuestion(nextIdx);
          }
        });
      }, 220);
    } else {
      transitionToQuestion(nextIdx, 'forward');
    }
  }

  function goBack() {
    var idx = S.currentQ;
    if (idx === 0) return;

    var prevIdx = idx - 1;
    transitionToQuestion(prevIdx, 'back');
  }

  /* ── Start assessment (after context or skip) ────────────────── */
  function startAssessment() {
    var isFirst = !S.startedAt;
    if (!S.startedAt) S.startedAt = Date.now();
    if (isFirst && window.QTSI_GA) {
      window.QTSI_GA.event('assessment_started', {
        method  : 'fresh_start',
        industry: S.context.industry || '',
        role    : S.context.role     || '',
      });
    }
    showZone('ag-assessment');

    /* Show question wrap, hide intro */
    var intro = qs('#ag-cat-intro');
    var qWrap = qs('#ag-question-wrap');
    if (intro) intro.style.display = 'none';
    if (qWrap) qWrap.style.display = '';

    showCategoryIntro(catForQ(S.currentQ), function () {
      buildQuestion(S.currentQ);
      updateProgress();
    });
  }

  /* ── Calculating sequence ────────────────────────────────────── */
  function startCalculating() {
    showZone('ag-calculating');
    var items = qsa('.ag-calc-item');
    var scoreEl = qs('#ag-calc-score-num');
    var scoreWrap = qs('.ag-calc-score');
    var finalScore = computeTotal();
    if (window.QTSI_GA) {
      window.QTSI_GA.event('assessment_completed', {
        score                    : finalScore,
        maturity_level           : getMaturity(finalScore).level,
        time_to_complete_seconds : S.startedAt ? Math.round((Date.now() - S.startedAt) / 1000) : 0,
        industry                 : S.context.industry || '',
        role                     : S.context.role     || '',
      });
    }
    var delay = 0;

    items.forEach(function (item, i) {
      delay += 700 + i * 200;
      (function (el, d) {
        setTimeout(function () {
          /* Mark previous done */
          items.forEach(function (prev, pi) {
            if (pi < i) prev.classList.add('is-done');
          });
          el.classList.add('is-active');
        }, d);
      })(item, delay);
    });

    /* After all items, animate score counter */
    var scoringDelay = delay + 600;
    setTimeout(function () {
      items.forEach(function (el) { el.classList.add('is-done'); el.classList.remove('is-active'); });
      if (scoreWrap) scoreWrap.classList.add('is-visible');

      /* Count up animation */
      var start = 0;
      var duration = 1200;
      var startTime = null;

      function animateScore(ts) {
        if (!startTime) startTime = ts;
        var elapsed = ts - startTime;
        var progress = Math.min(elapsed / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = Math.round(start + (finalScore - start) * eased);
        if (scoreEl) scoreEl.textContent = current;
        if (progress < 1) {
          requestAnimationFrame(animateScore);
        } else {
          /* Short pause then show results stub */
          setTimeout(showResults, 1000);
        }
      }
      requestAnimationFrame(animateScore);
    }, scoringDelay);
  }

  /* ── Scoring ─────────────────────────────────────────────────── */
  function computeTotal() {
    var total = 0;
    for (var i = 0; i < QUESTIONS.length; i++) {
      total += (S.answers[i] !== undefined) ? S.answers[i] : 0;
    }
    return total;
  }

  function computeCategoryScores() {
    var scores = {};
    CATEGORIES.forEach(function (cat) {
      var catQs = QUESTIONS.filter(function (q) { return q.cat === cat.id; });
      var score = 0;
      catQs.forEach(function (q, localIdx) {
        var globalIdx = QUESTIONS.indexOf(q);
        score += (S.answers[globalIdx] !== undefined) ? S.answers[globalIdx] : 0;
      });
      scores[cat.id] = score; /* max 20 */
    });
    return scores;
  }

  function getMaturity(score) {
    for (var i = 0; i < MATURITY.length; i++) {
      if (score >= MATURITY[i].min && score <= MATURITY[i].max) return MATURITY[i];
    }
    return MATURITY[0];
  }

  /* ── Phase 2 data: roadmap actions ──────────────────────────── */
  var ROADMAP_ACTIONS = {
    governance: {
      30: [
        'Appoint a named AI governance champion at VP level or above with a formal, documented mandate to act.',
        'Conduct a two-hour executive working session to define your organization\'s AI risk appetite and governance principles.'
      ],
      60: [
        'Build an AI system inventory mapping every deployed tool to a business owner, risk classification, and review date.',
        'Draft your first AI Governance Policy using the accountability framework outlined in Chapter 2 of The AI Mandate.'
      ],
      90: [
        'Establish a cross-functional AI governance committee with defined membership, authority, and a quarterly reporting cadence.',
        'Present your AI governance framework to the board, including defined KPIs, an escalation path, and risk appetite thresholds.'
      ]
    },
    security: {
      30: [
        'Conduct an AI-specific threat assessment for your three most critical AI systems, covering prompt injection, model manipulation, and data pipeline integrity.',
        'Implement privileged access controls that separate AI system administration from standard IT access, with audit logging enabled.'
      ],
      60: [
        'Add AI-specific incident scenarios to your incident response playbooks: model compromise, biased output deployment, and adversarial data poisoning.',
        'Complete a security requirements review of all active third-party AI vendor contracts, including data handling and breach notification clauses.'
      ],
      90: [
        'Deploy continuous monitoring with defined anomaly alert thresholds for your highest-risk AI systems in production.',
        'Run an AI security tabletop exercise with your executive team, CISO, and key AI system owners — document findings and assign remediation owners.'
      ]
    },
    compliance: {
      30: [
        'Map your top five AI use cases against Canada\'s AIDA, PIPEDA/Bill C-27 obligations, and any applicable sector-specific regulations.',
        'Identify every AI system making consequential decisions affecting employees, customers, credit, benefits, or regulatory reporting.'
      ],
      60: [
        'Commission privacy impact assessments for all AI systems that process personal information — prioritize those affecting individuals directly.',
        'Develop explainability documentation for high-stakes AI decision systems to support regulatory inquiries and internal audit review.'
      ],
      90: [
        'Establish a regulatory monitoring process to track AIDA implementation timelines, EU AI Act obligations, and provincial legislative developments.',
        'Complete algorithmic bias testing for every AI system involved in hiring, credit, benefits access, or law enforcement-adjacent functions.'
      ]
    },
    operations: {
      30: [
        'Deploy performance monitoring dashboards for your three most business-critical AI systems, with defined alert thresholds for accuracy, latency, and drift.',
        'Document the complete model lifecycle — from development and testing through deployment and retirement — for your highest-risk AI system.'
      ],
      60: [
        'Develop a standardized AI incident reporting and triage process, including severity classification, response SLAs, and a named incident owner.',
        'Deliver role-specific AI governance training to all personnel with AI oversight, procurement, or deployment responsibilities.'
      ],
      90: [
        'Implement automated model drift detection with structured remediation workflows and root-cause documentation for all production AI.',
        'Conduct an operational resilience review of your critical AI vendor dependencies, including concentration risk assessment and documented exit plans.'
      ]
    },
    leadership: {
      30: [
        'Assign formal, named C-suite accountability for AI governance outcomes — this responsibility cannot be delegated below the VP level.',
        'Brief the CEO and CIO on your top three AI governance gaps and their associated regulatory, reputational, and operational risk exposure.'
      ],
      60: [
        'Develop a multi-year AI governance budget proposal with dedicated headcount, tooling, compliance, and training line items for the next fiscal cycle.',
        'Conduct a structured board AI governance briefing covering your regulatory obligations, current posture score, and defined risk appetite.'
      ],
      90: [
        'Draft and formally adopt your organization\'s Responsible AI Principles — endorsed by the executive team, communicated to all staff, and published externally.',
        'Establish board-level AI governance KPIs including regulatory compliance coverage, policy enforcement rates, and AI incident metrics, reported quarterly.'
      ]
    }
  };

  var PEER_BENCHMARKS = {
    financial:     { avg: 52, top25: 68, label: 'Canadian financial services organizations' },
    healthcare:    { avg: 46, top25: 62, label: 'Canadian healthcare organizations' },
    energy:        { avg: 44, top25: 60, label: 'Canadian energy sector organizations' },
    technology:    { avg: 58, top25: 74, label: 'Canadian technology companies' },
    government:    { avg: 40, top25: 56, label: 'Canadian public sector organizations' },
    professional:  { avg: 50, top25: 66, label: 'Canadian professional services firms' },
    manufacturing: { avg: 38, top25: 54, label: 'Canadian manufacturing organizations' },
    other:         { avg: 44, top25: 60, label: 'organizations in your sector' },
    _default:      { avg: 44, top25: 61, label: 'Canadian organizations' }
  };

  /* ── Phase 2: Full results dashboard ────────────────────────── */
  function showResults() {
    var total     = computeTotal();
    var catScores = computeCategoryScores();
    var maturity  = getMaturity(total);

    if (window.QTSI_GA) {
      var sorted = CATEGORIES.slice().sort(function (a, b) {
        return (catScores[a.id] || 0) - (catScores[b.id] || 0);
      });
      window.QTSI_GA.event('assessment_results_viewed', {
        score        : total,
        maturity_level: maturity.level,
        top_gap      : sorted[0]                 ? sorted[0].label                 : '',
        top_strength : sorted[sorted.length - 1] ? sorted[sorted.length - 1].label : '',
        industry     : S.context.industry || '',
      });
    }

    clearSaved();
    showZone('ag-results');

    /* Print date */
    var printDate = qs('#ag-print-date');
    if (printDate) {
      var now = new Date();
      printDate.textContent = 'Assessment Date: ' + now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0');
    }

    /* Maturity badge + description */
    var badge = qs('#ag-maturity-badge');
    if (badge) { badge.textContent = maturity.level; badge.setAttribute('data-level', maturity.level.toLowerCase()); }
    var descEl = qs('#ag-maturity-desc');
    if (descEl) descEl.textContent = maturity.desc;

    buildContextSummary();

    /* Score ring (slight delay so CSS transition triggers) */
    setTimeout(function () { buildScoreRing(total); }, 120);

    buildCategoryBars(catScores);
    setTimeout(function () { drawRadar(catScores); }, 160);
    buildInsights(total, catScores);
    var roadmapText = buildRoadmap(catScores, total);

    setupAdvisorContext(total, catScores, maturity, roadmapText);
    buildPrintBreakdown(total, catScores, maturity, roadmapText);

    /* Paid assessment hook — fires after roadmapText is available */
    if (typeof window.QTSI_ON_COMPLETE === 'function') {
      window.QTSI_ON_COMPLETE({
        total:       total,
        catScores:   catScores,
        maturity:    maturity,
        context:     S.context,
        answers:     S.answers,
        roadmapText: roadmapText,
      });
    }

    var zone = qs('#ag-results');
    if (zone) setTimeout(function () { zone.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 80);
  }

  function buildContextSummary() {
    var el = qs('#ag-context-summary');
    if (!el) return;
    var roleLabels = { csuite: 'C-Suite', it: 'IT/Technology', risk: 'Risk & Compliance', board: 'Board', consultant: 'Consultant', other: 'Leader' };
    var parts = [];
    if (S.context.size)     parts.push(S.context.size + ' employees');
    if (S.context.industry) parts.push(S.context.industry.charAt(0).toUpperCase() + S.context.industry.slice(1));
    if (S.context.region)   parts.push(S.context.region === 'canada' ? 'Canada' : S.context.region === 'us' ? 'United States' : S.context.region === 'eu' ? 'EU' : 'International');
    if (S.context.role)     parts.push(roleLabels[S.context.role] || S.context.role);
    if (parts.length > 0) { el.textContent = parts.join(' · '); el.style.display = 'inline-block'; }
    else el.style.display = 'none';
  }

  function buildScoreRing(total) {
    var fillEl = qs('#ag-ring-fill');
    var numEl  = qs('#ag-ring-num');
    if (fillEl) {
      var circumference = 2 * Math.PI * 100; /* ≈ 628.3, matches r="100" in SVG */
      fillEl.style.strokeDasharray  = circumference;
      fillEl.style.strokeDashoffset = circumference;
      fillEl.getBoundingClientRect(); /* force reflow */
      fillEl.style.strokeDashoffset = circumference - (total / 100) * circumference;
    }
    if (numEl) {
      var dur = 1600, t0 = null;
      function tick(ts) {
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        numEl.textContent = Math.round(total * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
  }

  function buildCategoryBars(catScores) {
    var container = qs('#ag-cat-bars');
    if (!container) return;
    container.innerHTML = '';
    var sorted = CATEGORIES.slice().sort(function (a, b) { return (catScores[b.id] || 0) - (catScores[a.id] || 0); });
    sorted.forEach(function (cat) {
      var score = catScores[cat.id] || 0;
      var pct   = Math.round((score / 20) * 100);
      var grade = pct >= 75 ? 'Strong' : pct >= 50 ? 'Developing' : pct >= 25 ? 'Aware' : 'Critical';
      var div = document.createElement('div');
      div.className = 'ag-bar-item';
      div.innerHTML =
        '<div class="ag-bar-header">' +
          '<span class="ag-bar-name" style="color:' + cat.color + '">' + cat.label + '</span>' +
          '<div class="ag-bar-right">' +
            '<span class="ag-bar-score">' + score + '<span class="ag-bar-max"> /20</span></span>' +
            '<span class="ag-bar-grade" data-grade="' + grade.toLowerCase() + '">' + grade + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="ag-bar-track"><div class="ag-bar-fill" data-pct="' + pct + '" style="background:' + cat.color + '"></div></div>';
      container.appendChild(div);
    });
    setTimeout(function () {
      qsa('.ag-bar-fill', container).forEach(function (f) { f.style.width = f.getAttribute('data-pct') + '%'; });
    }, 240);
  }

  function drawRadar(catScores) {
    var canvas = qs('#ag-radar');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var w = canvas.width, h = canvas.height;
    var cx = w / 2, cy = h / 2, maxR = Math.min(w, h) * 0.36;
    var n = CATEGORIES.length;
    var catOrder = ['governance', 'security', 'compliance', 'operations', 'leadership'];

    function angle(i) { return (Math.PI * 2 * i / n) - Math.PI / 2; }
    function pt(i, r) { var a = angle(i); return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }; }

    ctx.clearRect(0, 0, w, h);

    /* Grid */
    [0.25, 0.5, 0.75, 1].forEach(function (f) {
      ctx.beginPath();
      for (var i = 0; i < n; i++) { var p = pt(i, maxR * f); if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); }
      ctx.closePath();
      ctx.strokeStyle = f === 1 ? 'rgba(255,255,255,.14)' : 'rgba(255,255,255,.07)';
      ctx.lineWidth = 1; ctx.stroke();
    });

    /* Axes */
    for (var i = 0; i < n; i++) {
      var p = pt(i, maxR);
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.lineWidth = 1; ctx.stroke();
    }

    /* Score polygon */
    ctx.beginPath();
    catOrder.forEach(function (cid, i) {
      var v = (catScores[cid] || 0) / 20;
      var p = pt(i, maxR * v);
      if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(201,168,76,.18)'; ctx.fill();
    ctx.strokeStyle = '#C9A84C'; ctx.lineWidth = 2; ctx.stroke();

    /* Dots */
    catOrder.forEach(function (cid, i) {
      var v = (catScores[cid] || 0) / 20;
      var p = pt(i, maxR * v);
      ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#C9A84C'; ctx.fill();
      ctx.strokeStyle = 'rgba(7,7,12,.8)'; ctx.lineWidth = 1.5; ctx.stroke();
    });

    /* Labels */
    catOrder.forEach(function (cid, i) {
      var cat = CATEGORIES[catIndex(cid)];
      var p = pt(i, maxR + 28);
      ctx.fillStyle = cat.color;
      ctx.font = 'bold 11px -apple-system,BlinkMacSystemFont,Inter,sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(cat.label, p.x, p.y);
    });
  }

  function buildInsights(total, catScores) {
    var sorted   = CATEGORIES.slice().sort(function (a, b) { return (catScores[b.id] || 0) - (catScores[a.id] || 0); });
    var strongest = sorted.slice(0, 2);
    var weakest   = sorted.slice(-2).reverse();

    /* Strengths */
    var strengthsEl = qs('#ag-strengths');
    if (strengthsEl) {
      strengthsEl.innerHTML = '';
      strongest.forEach(function (cat) {
        var score = catScores[cat.id] || 0;
        var div = document.createElement('div');
        div.className = 'ag-insight-item';
        div.innerHTML = '<span class="ag-insight-dot" style="background:' + cat.color + '"></span>' +
          '<div><strong style="color:' + cat.color + '">' + cat.label + '</strong>' +
          '<span class="ag-insight-score">' + score + ' / 20 &middot; ' + Math.round((score / 20) * 100) + '%</span></div>';
        strengthsEl.appendChild(div);
      });
      var n = document.createElement('p'); n.className = 'ag-insight-note';
      n.textContent = 'These dimensions represent your governance foundation. Protect and build on them as your program matures.';
      strengthsEl.appendChild(n);
    }

    /* Gaps */
    var gapsEl = qs('#ag-gaps');
    if (gapsEl) {
      gapsEl.innerHTML = '';
      weakest.forEach(function (cat) {
        var score = catScores[cat.id] || 0;
        var div = document.createElement('div');
        div.className = 'ag-insight-item';
        div.innerHTML = '<span class="ag-insight-dot" style="background:' + cat.color + '"></span>' +
          '<div><strong style="color:' + cat.color + '">' + cat.label + '</strong>' +
          '<span class="ag-insight-score">' + score + ' / 20 &middot; ' + Math.round((score / 20) * 100) + '%</span></div>';
        gapsEl.appendChild(div);
      });
      var n = document.createElement('p'); n.className = 'ag-insight-note';
      n.textContent = 'These categories carry the highest regulatory and operational risk exposure. Your roadmap prioritizes them directly.';
      gapsEl.appendChild(n);
    }

    /* Risk areas */
    var risksEl = qs('#ag-risks');
    if (risksEl) {
      risksEl.innerHTML = '';
      var riskItems = [];
      weakest.forEach(function (cat) {
        QUESTIONS.forEach(function (q, idx) {
          if (q.cat === cat.id && (S.answers[idx] === undefined || S.answers[idx] <= 1)) {
            riskItems.push({ cat: cat, text: q.text.length > 90 ? q.text.substring(0, 87) + '...' : q.text });
          }
        });
      });
      if (riskItems.length === 0) {
        var ok = document.createElement('p'); ok.className = 'ag-insight-note';
        ok.textContent = 'No critical (0–1) responses detected in your weakest categories. Continue your improvement program to reach the Governed tier.';
        risksEl.appendChild(ok);
      } else {
        riskItems.slice(0, 3).forEach(function (r) {
          var div = document.createElement('div'); div.className = 'ag-insight-item';
          div.innerHTML = '<span class="ag-insight-dot" style="background:#EF4444"></span>' +
            '<p class="ag-risk-text">' + escapeHtml(r.text) + '</p>';
          risksEl.appendChild(div);
        });
      }
    }

    /* Peer benchmark */
    var peerEl = qs('#ag-peer');
    if (peerEl) {
      var industry = S.context && S.context.industry ? S.context.industry : '_default';
      var bench = PEER_BENCHMARKS[industry] || PEER_BENCHMARKS._default;
      var diff = total - bench.avg;
      var aboveTop = total >= bench.top25;
      peerEl.innerHTML =
        '<div class="ag-peer-score">' +
          '<div class="ag-peer-row"><span class="ag-peer-label">Your Score</span><span class="ag-peer-val ag-peer-val--you">' + total + '</span></div>' +
          '<div class="ag-peer-row"><span class="ag-peer-label">Industry Average</span><span class="ag-peer-val">' + bench.avg + '</span></div>' +
          '<div class="ag-peer-row"><span class="ag-peer-label">Top Quartile</span><span class="ag-peer-val">' + bench.top25 + '</span></div>' +
        '</div>' +
        '<p class="ag-peer-note">' +
          (aboveTop
            ? 'You are in the <strong>top quartile</strong> among ' + bench.label + '.'
            : 'You scored <strong>' + (diff > 0 ? '+' + diff + ' above' : Math.abs(diff) + ' below') + ' average</strong> for ' + bench.label + '.') +
          ' Based on QTSI\'s governance assessments across 200+ Canadian organizations.' +
        '</p>';
    }
  }

  function buildRoadmap(catScores, total) {
    var sorted   = CATEGORIES.slice().sort(function (a, b) { return (catScores[a.id] || 0) - (catScores[b.id] || 0); });
    var weakCats = sorted.slice(0, 3);
    var frames   = [
      { id: 'ag-rm-30', key: 30, title: 'Establish Foundations',   subtitle: 'Immediate actions with maximum near-term impact' },
      { id: 'ag-rm-60', key: 60, title: 'Build Structure',          subtitle: 'Formalizing what was initiated in month one' },
      { id: 'ag-rm-90', key: 90, title: 'Embed Governance',         subtitle: 'Driving toward systemic, measurable maturity' }
    ];
    var roadmapText = '';
    frames.forEach(function (frame) {
      var col = qs('#' + frame.id);
      if (!col) return;
      var titleEl    = qs('.ag-rm-title', col);
      var subtitleEl = qs('.ag-rm-subtitle', col);
      var listEl     = qs('.ag-rm-list', col);
      if (titleEl)    titleEl.textContent    = frame.title;
      if (subtitleEl) subtitleEl.textContent = frame.subtitle;
      if (!listEl) return;
      listEl.innerHTML = '';
      roadmapText += frame.key + '-Day (' + frame.title + '):\n';
      weakCats.forEach(function (cat) {
        var actions = ROADMAP_ACTIONS[cat.id] && ROADMAP_ACTIONS[cat.id][frame.key];
        if (!actions || !actions[0]) return;
        var actionText = actions[0];
        var li = document.createElement('li');
        li.className = 'ag-rm-item';
        li.innerHTML =
          '<span class="ag-rm-cat-dot" style="background:' + cat.color + '"></span>' +
          '<div class="ag-rm-item-body">' +
            '<span class="ag-rm-cat-label" style="color:' + cat.color + '">' + cat.label + '</span>' +
            '<p class="ag-rm-action">' + escapeHtml(actionText) + '</p>' +
          '</div>';
        listEl.appendChild(li);
        roadmapText += '- [' + cat.label + '] ' + actionText + '\n';
      });
      roadmapText += '\n';
    });
    return roadmapText;
  }

  function setupAdvisorContext(total, catScores, maturity, roadmapText) {
    var sorted    = CATEGORIES.slice().sort(function (a, b) { return (catScores[b.id] || 0) - (catScores[a.id] || 0); });
    var strongest = sorted.slice(0, 2).map(function (c) { return c.label + ' (' + catScores[c.id] + '/20)'; }).join(', ');
    var weakest   = sorted.slice(-2).reverse().map(function (c) { return c.label + ' (' + catScores[c.id] + '/20)'; }).join(', ');
    var catSummary = CATEGORIES.map(function (c) { return c.label + ': ' + catScores[c.id] + '/20'; }).join(', ');

    var contextMsg =
      'This executive just completed the QTSI AI Governance Readiness Assessment.\n\n' +
      'Results:\n' +
      'Overall Score: ' + total + '/100\n' +
      'Maturity Level: ' + maturity.level + '\n' +
      'Category Scores: ' + catSummary + '\n' +
      'Governance Strengths: ' + strongest + '\n' +
      'Priority Gaps: ' + weakest + '\n\n' +
      '90-Day Roadmap Priorities:\n' + roadmapText +
      'When answering questions, reference these specific results. ' +
      'Tie advice to their actual scores and maturity level. ' +
      'For a booking request, mention Manav Chadha and info@qtsi.ca.';

    var advisorBriefing =
      'I\'ve reviewed your AI Governance Readiness Assessment. You scored **' + total + '/100**, ' +
      'placing your organization at the **' + maturity.level + '** maturity level.\n\n' +
      'Your strongest dimensions are **' + strongest + '**. Your highest-priority gaps are **' + weakest + '**.\n\n' +
      'Your 90-day roadmap targets ' +
      sorted.slice(-2).reverse().map(function (c) { return c.label.toLowerCase(); }).join(' and ') +
      ' as the most critical areas to address. What would you like to explore — the regulatory implications of your gaps, how to structure your governance program, or how to prioritize your roadmap?';

    var preHistory = [
      { role: 'user',      content: contextMsg },
      { role: 'assistant', content: advisorBriefing }
    ];

    window.QTSI_AI = function (message, conversationHistory) {
      return fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: message, history: preHistory.concat(conversationHistory) })
      })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        return (data && data.reply) ? data.reply : 'The advisory service is temporarily unavailable.';
      });
    };
  }

  function buildPrintBreakdown(total, catScores, maturity, roadmapText) {
    var el = qs('#ag-print-breakdown');
    if (!el) return;
    var rows = CATEGORIES.map(function (cat) {
      var score = catScores[cat.id] || 0;
      return '<tr><td>' + cat.label + '</td><td>' + score + ' / 20</td><td>' + Math.round((score / 20) * 100) + '%</td></tr>';
    }).join('');
    el.innerHTML =
      '<h3 style="font-size:14px;margin:24px 0 8px;color:#07070C">Category Breakdown</h3>' +
      '<table class="ag-print-table"><tr><th>Dimension</th><th>Score</th><th>Percentage</th></tr>' + rows + '</table>' +
      '<h3 style="font-size:14px;margin:24px 0 8px;color:#07070C">90-Day Roadmap</h3>' +
      '<pre style="font-size:11px;color:#374151;white-space:pre-wrap;line-height:1.6">' + roadmapText + '</pre>' +
      '<p style="font-size:11px;color:#606878;margin-top:24px">QTSI — Quality Training & Technology Services Inc. · info@qtsi.ca · +1 780-716-5372 · qtsi.ca</p>';
  }

  /* ── Save button feedback ────────────────────────────────────── */
  function flashSaved() {
    var btn = qs('#ag-save-btn');
    if (!btn) return;
    btn.classList.add('is-saved');
    btn.textContent = 'Saved ✓';
    setTimeout(function () {
      btn.classList.remove('is-saved');
      btn.textContent = 'Save Progress';
    }, 2000);
  }

  /* ── Init ────────────────────────────────────────────────────── */
  function init() {
    /* Check for saved state */
    var saved = loadSaved();
    if (saved && saved.currentQ > 0) {
      var banner = qs('#ag-resume-banner');
      if (banner) {
        banner.hidden = false;
        var qEl = qs('#ag-resume-q');
        if (qEl) qEl.textContent = saved.currentQ + 1;
      }
      var resumeBtn = qs('#ag-resume-btn');
      if (resumeBtn) {
        resumeBtn.addEventListener('click', function () {
          S.currentQ  = saved.currentQ;
          S.answers   = saved.answers   || {};
          S.context   = saved.context   || {};
          S.startedAt = saved.startedAt || Date.now();
          if (banner) banner.hidden = true;
          startAssessment();
        });
      }
      var restartBtn = qs('#ag-restart-btn');
      if (restartBtn) {
        restartBtn.addEventListener('click', function () {
          clearSaved();
          if (banner) banner.hidden = true;
        });
      }
    }

    /* Landing — Begin */
    var beginBtn = qs('#ag-begin-btn');
    if (beginBtn) {
      beginBtn.addEventListener('click', function () { showZone('ag-context'); });
    }

    /* Context chips */
    qsa('.ag-chips').forEach(function (group) {
      var contextKey = group.getAttribute('data-context');
      qsa('.ag-chip', group).forEach(function (chip) {
        chip.addEventListener('click', function () {
          qsa('.ag-chip', group).forEach(function (c) { c.classList.remove('is-selected'); });
          chip.classList.add('is-selected');
          if (contextKey) S.context[contextKey] = chip.getAttribute('data-value');
        });
      });
    });

    /* Context — Continue / Skip */
    var ctxContinue = qs('#ag-context-continue');
    if (ctxContinue) ctxContinue.addEventListener('click', startAssessment);
    var ctxSkip = qs('#ag-context-skip');
    if (ctxSkip) ctxSkip.addEventListener('click', startAssessment);

    /* Nav — Back / Next */
    var backBtn = qs('#ag-nav-back');
    if (backBtn) backBtn.addEventListener('click', goBack);
    var nextBtn = qs('#ag-nav-next');
    if (nextBtn) nextBtn.addEventListener('click', goNext);

    /* Save button */
    var saveBtn = qs('#ag-save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', function () { saveState(); flashSaved(); });
    }

    /* Open AI Advisor button — triggers existing copilot FAB */
    var advisorBtn = qs('#ag-open-advisor-btn');
    if (advisorBtn) {
      advisorBtn.addEventListener('click', function () {
        var fab = document.getElementById('copilot-fab');
        if (fab) fab.click();
        else window.location.href = 'mailto:info@qtsi.ca?subject=AI+Governance+Strategy+Session';
      });
    }

    /* PDF export — window.print() with print CSS */
    var pdfBtn = qs('#ag-pdf-btn');
    if (pdfBtn) {
      pdfBtn.addEventListener('click', function () {
        document.title = 'QTSI AI Governance Assessment Report';
        window.print();
      });
    }

    /* Retake button */
    var retakeBtn = qs('#ag-retake-btn');
    if (retakeBtn) {
      retakeBtn.addEventListener('click', function () {
        S = { phase: 'landing', currentQ: 0, answers: {}, context: {}, startedAt: 0, currentCatIntro: -1 };
        clearSaved();
        window.QTSI_AI = undefined; /* remove assessment context hook */
        showZone('ag-landing');
      });
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
