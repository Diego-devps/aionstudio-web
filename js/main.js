/* ============================================================
   AION STUDIO — main.js
   ============================================================
   Tras refactor multilingüe nativo (W12 Camino B, sesión 7.4a):
   - El i18n ya NO se hace en runtime; cada idioma es una URL física
     generada por scripts/build.js. Eliminados translations{},
     applyTranslations(), initLangSelector(), localStorage 'aion_lang'.
   - Las strings que el JS necesita en runtime (feedback del form,
     aria-label del menú móvil) se leen del DOM vía data-attributes
     inyectados por el build.
   ============================================================ */

'use strict';

/* ============================================================
   NAVBAR — sticky + blur + mobile toggle
   ============================================================ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const toggle = document.querySelector('.nav-toggle');
  const navInner = document.querySelector('.nav-inner');
  if (!navbar || !toggle || !navInner) return;

  const labelOpen  = toggle.dataset.ariaLabelOpen  || 'Open menu';
  const labelClose = toggle.dataset.ariaLabelClose || 'Close menu';

  const onScroll = () => {
    if (window.scrollY > 40) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toggle.addEventListener('click', () => {
    const open = navInner.classList.toggle('mobile-open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-label', open ? labelClose : labelOpen);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  document.querySelectorAll('.nav-links a, .nav-right a').forEach(link => {
    link.addEventListener('click', () => {
      navInner.classList.remove('mobile-open');
      toggle.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ============================================================
   FADE-IN ANIMATIONS on scroll
   ============================================================ */
function initFadeInAnimations() {
  const targets = document.querySelectorAll('.servicio-card, .sector-card, .metrica-card, .mision-block, .founder-card');
  targets.forEach(el => el.classList.add('fade-in-up'));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(el => observer.observe(el));
}

/* ============================================================
   AUDITORÍA FORM (página /auditoria — W3 + W9 + W19)
   ============================================================
   POST a /api/contact (Vercel Serverless Function) con las 10 preguntas.
   Strings se leen de data-i18n-* inyectados por build según idioma.
   Q3="other" muestra campo libre adicional.
   ============================================================ */
function initAuditForm() {
  const form = document.getElementById('aud-form');
  if (!form) return;

  const feedback = document.getElementById('aud-feedback');
  const submitBtn = form.querySelector('[type="submit"]');
  const submitLabel = submitBtn ? submitBtn.textContent : '';

  const TXT = {
    successTitle: form.dataset.i18nSuccessTitle || 'Received.',
    successDesc:  form.dataset.i18nSuccessDesc  || '',
    errorRequired: form.dataset.i18nErrorRequired || 'Please fill in the required fields.',
    errorEmail:    form.dataset.i18nErrorEmail    || 'Email looks invalid.',
    errorServer:   form.dataset.i18nErrorServer   || 'There was a problem sending.',
    submitting:    form.dataset.i18nSubmitting    || 'Sending...',
  };

  // Q3 "otro" → mostrar/ocultar campo condicional.
  const q3 = form.querySelector('#q3_sector');
  const q3OtherWrap = form.querySelector('#q3_other_wrap');
  const q3OtherInput = form.querySelector('#q3_sector_otro');
  if (q3 && q3OtherWrap && q3OtherInput) {
    q3.addEventListener('change', () => {
      const showOther = q3.value === 'other';
      q3OtherWrap.hidden = !showOther;
      q3OtherInput.required = showOther;
      if (!showOther) q3OtherInput.value = '';
    });
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();

    form.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));

    // Validación de campos requeridos
    let firstInvalid = null;
    const required = form.querySelectorAll('[required]');
    for (const field of required) {
      const isRadioGroup = field.type === 'radio';
      const valid = isRadioGroup
        ? form.querySelector(`input[name="${field.name}"]:checked`)
        : field.value.trim();
      if (!valid) {
        if (!isRadioGroup) field.classList.add('input-error');
        if (!firstInvalid) firstInvalid = field;
      }
    }
    if (firstInvalid) {
      showFeedback('error', TXT.errorRequired);
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Validación email
    const emailField = form.querySelector('#q2_email');
    if (emailField && !emailField.validity.valid) {
      emailField.classList.add('input-error');
      showFeedback('error', TXT.errorEmail);
      emailField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Build payload (JSON)
    const formData = new FormData(form);
    const payload = {};
    for (const [k, v] of formData.entries()) payload[k] = v;

    submitBtn.disabled = true;
    submitBtn.textContent = TXT.submitting;

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        renderSuccess();
      } else {
        showFeedback('error', TXT.errorServer);
        submitBtn.disabled = false;
        submitBtn.textContent = submitLabel;
      }
    } catch (err) {
      showFeedback('error', TXT.errorServer);
      submitBtn.disabled = false;
      submitBtn.textContent = submitLabel;
    }
  });

  function renderSuccess() {
    const card = document.createElement('div');
    card.className = 'aud-success-card';
    card.innerHTML = `
      <h2 class="aud-success-title">${escapeHtml(TXT.successTitle)}</h2>
      <p class="aud-success-desc">${escapeHtml(TXT.successDesc)}</p>
    `;
    form.parentNode.replaceChild(card, form);
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function showFeedback(type, msg) {
    if (!feedback) return;
    feedback.className = 'aud-feedback ' + type;
    feedback.textContent = msg;
    if (type === 'error') {
      setTimeout(() => {
        feedback.className = 'aud-feedback';
        feedback.textContent = '';
      }, 8000);
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }
}

/* ============================================================
   SUBVENCIONES — tabs país (ES/FR) + acordeón de ayudas
   ============================================================
   Sólo se activa en /subvenciones/. Sustituye el script inline
   de la página vieja (eliminado al migrar al build editorial).
   ============================================================ */
function initSubvenciones() {
  const tabsNav = document.querySelector('.tabs-nav');
  if (!tabsNav) return;

  // Tabs país
  const tabBtns = tabsNav.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.tab;
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      tabBtns.forEach(b => b.classList.remove('active'));
      const panel = document.getElementById('tab-' + id);
      if (panel) panel.classList.add('active');
      btn.classList.add('active');
    });
  });

  // Acordeón (abre uno, cierra el resto)
  document.querySelectorAll('.acc-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.acc-item');
      if (!item) return;
      const body = item.querySelector('.acc-body');
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.acc-item').forEach(i => {
        i.classList.remove('open');
        const b = i.querySelector('.acc-body');
        if (b) b.style.maxHeight = null;
      });
      if (!wasOpen) {
        item.classList.add('open');
        if (body) body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });
}

/* ============================================================
   FOOTER — current year
   ============================================================ */
function setYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ============================================================
   SMOOTH SCROLL for in-page anchors
   ============================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  setYear();
  initNavbar();
  initFadeInAnimations();
  initAuditForm();
  initSubvenciones();
  initSmoothScroll();
});
