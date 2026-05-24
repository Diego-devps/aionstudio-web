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
   HERO CANVAS — animated geometric mesh
   ============================================================ */
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height, particles, animFrameId;
  const PARTICLE_COUNT = 80;
  const CONNECT_DIST = 140;
  const CYAN = '0, 212, 255';

  function resize() {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  }

  function createParticles() {
    particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.5 + 0.5,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, 'rgba(10,10,20,0)');
    grad.addColorStop(1, 'rgba(10,10,20,1)');

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT_DIST) {
          const opacity = (1 - dist / CONNECT_DIST) * 0.25;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${CYAN}, ${opacity})`;
          ctx.lineWidth = 0.6;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${CYAN}, 0.6)`;
      ctx.fill();
    });

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  function update() {
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width)  p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
    });
  }

  function loop() {
    update();
    draw();
    animFrameId = requestAnimationFrame(loop);
  }

  function init() {
    resize();
    createParticles();
    if (animFrameId) cancelAnimationFrame(animFrameId);
    loop();
  }

  const mouse = { x: -9999, y: -9999 };
  document.getElementById('hero').addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    particles.forEach(p => {
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        p.vx += dx / dist * 0.015;
        p.vy += dy / dist * 0.015;
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 1.5) { p.vx = (p.vx / speed) * 1.5; p.vy = (p.vy / speed) * 1.5; }
      }
    });
  });

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });

  init();
}

/* ============================================================
   FADE-IN ANIMATIONS on scroll
   ============================================================ */
function initFadeInAnimations() {
  const targets = document.querySelectorAll('.servicio-card, .metrica-card, .mision-block, .founder-card');
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
   CONTACT FORM
   ============================================================
   Endpoint: Formspree (legado) — se migra a /api/contact en bloque 2 (W3+W9).
   Strings de feedback se leen de data-i18n-success / data-i18n-error
   inyectados por el build script según idioma de la página.
   ============================================================ */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('form-feedback');
  if (!form) return;

  const SUCCESS_MSG = form.dataset.i18nSuccess || 'Message sent.';
  const ERROR_MSG   = form.dataset.i18nError   || 'Please fill in the required fields.';
  const submitBtn = form.querySelector('[type="submit"]');
  const submitLabel = submitBtn ? submitBtn.textContent : '';

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const nombre = form.nombre.value.trim();
    const email = form.email.value.trim();
    const empresa = form.empresa.value.trim();
    const mensaje = form.mensaje.value.trim();

    form.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));

    let hasError = false;
    if (!nombre)                                  { form.nombre.classList.add('input-error');  hasError = true; }
    if (!email || !form.email.validity.valid)     { form.email.classList.add('input-error');   hasError = true; }
    if (!empresa)                                 { form.empresa.classList.add('input-error'); hasError = true; }
    if (!mensaje)                                 { form.mensaje.classList.add('input-error'); hasError = true; }
    if (hasError) { showFeedback('error', ERROR_MSG); return; }

    submitBtn.disabled = true;
    submitBtn.textContent = '...';

    try {
      const response = await fetch('https://formspree.io/f/xaqpeawy', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form),
      });

      if (response.ok) {
        form.reset();
        showFeedback('success', SUCCESS_MSG);
      } else {
        showFeedback('error', ERROR_MSG);
      }
    } catch (err) {
      showFeedback('error', ERROR_MSG);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = submitLabel;
    }
  });

  function showFeedback(type, msg) {
    feedback.className = 'form-feedback ' + type;
    feedback.textContent = msg;
    setTimeout(() => {
      feedback.className = 'form-feedback';
      feedback.textContent = '';
    }, 5000);
  }
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
  initHeroCanvas();
  initFadeInAnimations();
  initContactForm();
  initSmoothScroll();
});
