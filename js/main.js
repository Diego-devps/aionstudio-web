/* ============================================================
   AION STUDIO — main.js
   ============================================================ */

'use strict';

/* ============================================================
   TRANSLATIONS
   ============================================================ */
const translations = {
  es: {
    nav_services: 'Servicios',
    nav_mission: 'Misión',
    nav_contact: 'Contacto',
    nav_cta: 'Auditoría Gratuita',
    hero_badge: 'Agencia de Inteligencia Artificial',
    hero_title: 'Automatiza tu empresa.<br /><span class="hero-highlight">Multiplica tus resultados.</span>',
    hero_subtitle: 'Implementamos soluciones de IA que trabajan 24/7 para tu negocio: agentes de voz, flujos automatizados y sistemas inteligentes que reducen costes y disparan tu ROI.',
    hero_cta1: 'Agenda tu Auditoría',
    hero_cta2: 'Ver Servicios',
    metric1_label: 'Clientes satisfechos',
    metric2_label: 'ROI promedio',
    metric3_label: 'Respuesta Voz IA',
    metric4_label: 'Disponibilidad',
    services_title: 'Nuestros Servicios',
    services_subtitle: 'Soluciones de IA diseñadas para transformar tu operativa',
    services_learn_more: 'Más información →',
    s1_tag: 'Agente de Voz',
    s1_desc: 'Agentes de voz con IA que atienden llamadas, cualifican leads y gestionan reservas de forma autónoma, 24 horas al día.',
    s1_f1: 'Atención ininterrumpida 24/7', s1_f2: 'Cualificación automática de leads', s1_f3: 'Integración con tu CRM',
    s2_tag: 'Automatización',
    s2_desc: 'Automatiza flujos de trabajo complejos: desde onboarding de clientes hasta facturación y reportes, sin intervención manual.',
    s2_f1: 'Flujos multi-plataforma', s2_f2: 'Onboarding automatizado', s2_f3: 'Reportes automáticos',
    s3_tag: 'Bandeja IA',
    s3_desc: 'Centraliza y gestiona todas tus comunicaciones con IA: emails, WhatsApp y chats clasificados, priorizados y respondidos automáticamente.',
    s3_f1: 'Clasificación inteligente', s3_f2: 'Respuestas automáticas', s3_f3: 'Multi-canal unificado',
    s4_tag: 'Web con IA',
    s4_desc: 'Webs de alto rendimiento con asistentes inteligentes integrados, personalización dinámica y analítica avanzada para maximizar conversiones.',
    s4_f1: 'Chat IA embebido', s4_f2: 'Personalización dinámica', s4_f3: 'Analytics avanzado',
    mission_label: 'Nuestra Misión',
    mission_title: 'Democratizar la IA para empresas que quieren crecer',
    mission_text: 'En Aion Studio creemos que la inteligencia artificial no debe ser exclusiva de las grandes corporaciones. Nuestra misión es poner al alcance de cualquier empresa las herramientas de automatización e IA que multiplican su capacidad operativa sin disparar sus costes.',
    vision_label: 'Nuestra Visión',
    vision_text: 'Ser el partner tecnológico de referencia para empresas latinoamericanas y europeas que buscan liderar su sector mediante la adopción estratégica de inteligencia artificial, construyendo un futuro donde humanos y máquinas trabajan en perfecta sinergia.',
    value1: 'Resultados medibles', value2: 'Implementación ágil', value3: 'Soporte continuo',
    founder_role: 'Fundador & Lead Engineer',
    founder_quote: '"La IA no sustituirá a las Pymes, pero las Pymes con IA sustituirán a las que no la usen."',
    form_title: 'Agenda tu Auditoría Gratuita',
    form_desc: 'En 30 minutos analizamos tu empresa y te mostramos exactamente qué procesos pueden automatizarse y cuánto podrías ahorrar.',
    benefit1: 'Sin compromiso ni coste', benefit2: 'Análisis personalizado', benefit3: 'Plan de acción inmediato',
    form_name: 'Nombre', form_name_ph: 'Tu nombre',
    form_company: 'Empresa', form_company_ph: 'Nombre de tu empresa',
    form_email: 'Email',
    form_service: 'Servicio de interés', form_service_ph: 'Selecciona un servicio',
    form_other: 'Otro / No sé aún',
    form_message: 'Cuéntanos tu reto', form_message_ph: '¿Qué proceso te gustaría automatizar?',
    form_submit: 'Solicitar Auditoría Gratuita',
    form_success: '¡Mensaje enviado! Te contactaremos en menos de 24 horas.',
    form_error: 'Por favor, completa los campos requeridos.',
    footer_tagline: 'Inteligencia Artificial para empresas que no se conforman.',
    footer_services: 'Servicios', footer_webai: 'Web con IA',
    footer_company: 'Empresa', footer_mission: 'Misión & Visión', footer_audit: 'Auditoría Gratuita', footer_blog: 'Blog',
    footer_contact: 'Contacto', footer_location: 'Pennautier, Francia',
    footer_rights: 'Todos los derechos reservados.',
    footer_privacy: 'Política de Privacidad', footer_terms: 'Términos de Uso', footer_cookies: 'Cookies',
  },

  fr: {
    nav_services: 'Services',
    nav_mission: 'Mission',
    nav_contact: 'Contact',
    nav_cta: 'Audit Gratuit',
    hero_badge: 'Agence d\'Intelligence Artificielle',
    hero_title: 'Automatisez votre entreprise.<br /><span class="hero-highlight">Multipliez vos résultats.</span>',
    hero_subtitle: 'Nous déployons des solutions IA qui travaillent 24h/24 pour votre activité : agents vocaux, flux automatisés et systèmes intelligents qui réduisent les coûts et boostent votre ROI.',
    hero_cta1: 'Planifier mon Audit',
    hero_cta2: 'Voir les Services',
    metric1_label: 'Clients satisfaits',
    metric2_label: 'ROI moyen',
    metric3_label: 'Réponse Agent Vocal',
    metric4_label: 'Disponibilité',
    services_title: 'Nos Services',
    services_subtitle: 'Des solutions IA conçues pour transformer votre activité',
    services_learn_more: 'En savoir plus →',
    s1_tag: 'Agent Vocal',
    s1_desc: 'Agents vocaux IA qui répondent aux appels, qualifient les leads et gèrent les réservations de façon autonome, 24h/24.',
    s1_f1: 'Disponibilité 24/7', s1_f2: 'Qualification automatique', s1_f3: 'Intégration CRM',
    s2_tag: 'Automatisation',
    s2_desc: 'Automatisez les flux de travail complexes : de l\'onboarding à la facturation et aux rapports, sans intervention manuelle.',
    s2_f1: 'Flux multi-plateformes', s2_f2: 'Onboarding automatisé', s2_f3: 'Rapports automatiques',
    s3_tag: 'Boîte IA',
    s3_desc: 'Centralisez et gérez toutes vos communications avec l\'IA : emails, WhatsApp et chats classifiés, priorisés et répondus automatiquement.',
    s3_f1: 'Classification intelligente', s3_f2: 'Réponses automatiques', s3_f3: 'Multi-canal unifié',
    s4_tag: 'Web IA',
    s4_desc: 'Sites haute performance avec assistants intelligents intégrés, personnalisation dynamique et analytics avancé pour maximiser les conversions.',
    s4_f1: 'Chat IA intégré', s4_f2: 'Personnalisation dynamique', s4_f3: 'Analytics avancé',
    mission_label: 'Notre Mission',
    mission_title: 'Démocratiser l\'IA pour les entreprises qui veulent grandir',
    mission_text: 'Chez Aion Studio, nous croyons que l\'intelligence artificielle ne doit pas être réservée aux grandes entreprises. Notre mission est de mettre à la portée de toute entreprise les outils d\'automatisation et d\'IA qui multiplient sa capacité opérationnelle sans exploser les coûts.',
    vision_label: 'Notre Vision',
    vision_text: 'Être le partenaire technologique de référence pour les entreprises latino-américaines et européennes souhaitant mener leur secteur grâce à l\'adoption stratégique de l\'IA, construisant un avenir où humains et machines travaillent en parfaite synergie.',
    value1: 'Résultats mesurables', value2: 'Mise en œuvre agile', value3: 'Support continu',
    founder_role: 'Fondateur & Lead Engineer',
    founder_quote: '"L\'IA ne remplacera pas les PME, mais les PME avec IA remplaceront celles qui ne l\'utilisent pas."',
    form_title: 'Planifiez votre Audit Gratuit',
    form_desc: 'En 30 minutes nous analysons votre entreprise et vous montrons exactement quels processus peuvent être automatisés et combien vous pourriez économiser.',
    benefit1: 'Sans engagement ni coût', benefit2: 'Analyse personnalisée', benefit3: 'Plan d\'action immédiat',
    form_name: 'Prénom', form_name_ph: 'Votre prénom',
    form_company: 'Entreprise', form_company_ph: 'Nom de votre entreprise',
    form_email: 'Email',
    form_service: 'Service d\'intérêt', form_service_ph: 'Sélectionnez un service',
    form_other: 'Autre / Je ne sais pas encore',
    form_message: 'Parlez-nous de votre défi', form_message_ph: 'Quel processus aimeriez-vous automatiser ?',
    form_submit: 'Demander mon Audit Gratuit',
    form_success: 'Message envoyé ! Nous vous contacterons sous 24 heures.',
    form_error: 'Veuillez remplir les champs obligatoires.',
    footer_tagline: 'Intelligence Artificielle pour les entreprises qui ne se contentent pas du minimum.',
    footer_services: 'Services', footer_webai: 'Web IA',
    footer_company: 'Entreprise', footer_mission: 'Mission & Vision', footer_audit: 'Audit Gratuit', footer_blog: 'Blog',
    footer_contact: 'Contact', footer_location: 'Pennautier, France',
    footer_rights: 'Tous droits réservés.',
    footer_privacy: 'Politique de Confidentialité', footer_terms: 'Conditions d\'Utilisation', footer_cookies: 'Cookies',
  },

  en: {
    nav_services: 'Services',
    nav_mission: 'Mission',
    nav_contact: 'Contact',
    nav_cta: 'Free Audit',
    hero_badge: 'Artificial Intelligence Agency',
    hero_title: 'Automate your business.<br /><span class="hero-highlight">Multiply your results.</span>',
    hero_subtitle: 'We deploy AI solutions that work 24/7 for your business: voice agents, automated workflows and intelligent systems that cut costs and skyrocket your ROI.',
    hero_cta1: 'Book my Audit',
    hero_cta2: 'View Services',
    metric1_label: 'Happy clients',
    metric2_label: 'Average ROI',
    metric3_label: 'Voice AI Response',
    metric4_label: 'Availability',
    services_title: 'Our Services',
    services_subtitle: 'AI solutions designed to transform your operations',
    services_learn_more: 'Learn more →',
    s1_tag: 'Voice Agent',
    s1_desc: 'AI-powered voice agents that handle calls, qualify leads and manage bookings autonomously, 24 hours a day.',
    s1_f1: 'Uninterrupted 24/7 coverage', s1_f2: 'Automatic lead qualification', s1_f3: 'CRM integration',
    s2_tag: 'Automation',
    s2_desc: 'Automate complex workflows: from client onboarding to invoicing and reporting, without manual intervention.',
    s2_f1: 'Multi-platform flows', s2_f2: 'Automated onboarding', s2_f3: 'Automatic reports',
    s3_tag: 'AI Inbox',
    s3_desc: 'Centralise and manage all your communications with AI: emails, WhatsApp and chats classified, prioritised and answered automatically.',
    s3_f1: 'Smart classification', s3_f2: 'Automatic replies', s3_f3: 'Unified multi-channel',
    s4_tag: 'AI Website',
    s4_desc: 'High-performance websites with integrated intelligent assistants, dynamic personalisation and advanced analytics to maximise conversions.',
    s4_f1: 'Embedded AI chat', s4_f2: 'Dynamic personalisation', s4_f3: 'Advanced analytics',
    mission_label: 'Our Mission',
    mission_title: 'Democratising AI for companies that want to grow',
    mission_text: 'At Aion Studio we believe artificial intelligence should not be exclusive to large corporations. Our mission is to bring automation and AI tools to any business, multiplying their operational capacity without blowing up their costs.',
    vision_label: 'Our Vision',
    vision_text: 'To be the go-to technology partner for Latin American and European companies seeking to lead their industry through strategic AI adoption, building a future where humans and machines work in perfect synergy.',
    value1: 'Measurable results', value2: 'Agile implementation', value3: 'Ongoing support',
    founder_role: 'Founder & Lead Engineer',
    founder_quote: '"AI won\'t replace SMEs, but SMEs with AI will replace those without it."',
    form_title: 'Book your Free Audit',
    form_desc: 'In 30 minutes we analyse your business and show you exactly which processes can be automated and how much you could save.',
    benefit1: 'No commitment or cost', benefit2: 'Personalised analysis', benefit3: 'Immediate action plan',
    form_name: 'Name', form_name_ph: 'Your name',
    form_company: 'Company', form_company_ph: 'Your company name',
    form_email: 'Email',
    form_service: 'Service of interest', form_service_ph: 'Select a service',
    form_other: 'Other / Not sure yet',
    form_message: 'Tell us your challenge', form_message_ph: 'Which process would you like to automate?',
    form_submit: 'Request Free Audit',
    form_success: 'Message sent! We\'ll get back to you within 24 hours.',
    form_error: 'Please fill in the required fields.',
    footer_tagline: 'Artificial Intelligence for businesses that refuse to settle.',
    footer_services: 'Services', footer_webai: 'AI Website',
    footer_company: 'Company', footer_mission: 'Mission & Vision', footer_audit: 'Free Audit', footer_blog: 'Blog',
    footer_contact: 'Contact', footer_location: 'Pennautier, France',
    footer_rights: 'All rights reserved.',
    footer_privacy: 'Privacy Policy', footer_terms: 'Terms of Use', footer_cookies: 'Cookies',
  }
};

let currentLang = 'es';

function applyTranslations(lang) {
  const t = translations[lang];
  if (!t) return;
  currentLang = lang;

  // Text nodes
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key] !== undefined) {
      el.innerHTML = t[key];
    }
  });

  // Placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (t[key] !== undefined) {
      el.setAttribute('placeholder', t[key]);
    }
  });

  // html lang attribute
  document.documentElement.lang = lang;
}

function initLangSelector() {
  const buttons = document.querySelectorAll('.lang-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyTranslations(btn.dataset.lang);
    });
  });
}

/* ============================================================
   NAVBAR — sticky + blur + mobile toggle
   ============================================================ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const toggle = document.querySelector('.nav-toggle');
  const navInner = document.querySelector('.nav-inner');

  // Scroll
  const onScroll = () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  toggle.addEventListener('click', () => {
    const open = navInner.classList.toggle('mobile-open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Close mobile on link click
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

    // Gradient overlay at bottom
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, 'rgba(10,10,20,0)');
    grad.addColorStop(1, 'rgba(10,10,20,1)');

    // Draw connections
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

    // Draw particles
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${CYAN}, 0.6)`;
      ctx.fill();
    });

    // Gradient mask
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

  // Mouse parallax
  let mouse = { x: -9999, y: -9999 };
  document.getElementById('hero').addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    // Subtle attraction of nearby particles
    particles.forEach(p => {
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        p.vx += dx / dist * 0.015;
        p.vy += dy / dist * 0.015;
        // Clamp velocity
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
   COUNTERS — animated on scroll into view
   ============================================================ */
function initCounters() {
  const counters = document.querySelectorAll('.counter');
  let observed = new Set();

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !observed.has(entry.target)) {
        observed.add(entry.target);
        animateCounter(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const isDecimal = el.dataset.decimal === '1';
  const duration = 1800;
  const start = performance.now();

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = target * ease;
    el.textContent = isDecimal ? current.toFixed(1) : Math.floor(current);
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = isDecimal ? target.toFixed(1) : target;
  }
  requestAnimationFrame(tick);
}

/* ============================================================
   FADE-IN ANIMATIONS on scroll
   ============================================================ */
function initFadeInAnimations() {
  // Add fade-in-up to service cards, metrica cards, etc.
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
   ============================================================ */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('form-feedback');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const t = translations[currentLang];
    const nombre = form.nombre.value.trim();
    const email = form.email.value.trim();

    if (!nombre || !email) {
      showFeedback('error', t.form_error || 'Por favor, completa los campos requeridos.');
      return;
    }

    // Simulate async submit
    const btn = form.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.textContent = '...';

    setTimeout(() => {
      form.reset();
      btn.disabled = false;
      btn.textContent = t.form_submit || 'Solicitar Auditoría Gratuita';
      showFeedback('success', t.form_success || '¡Mensaje enviado! Te contactaremos pronto.');
    }, 1200);
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
   SMOOTH SCROLL for nav links (already handled by CSS,
   but also stop mobile menu flicker)
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
  initLangSelector();
  applyTranslations('es');
  initNavbar();
  initHeroCanvas();
  initCounters();
  initFadeInAnimations();
  initContactForm();
  initSmoothScroll();
});
