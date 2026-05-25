// api/contact.js — Vercel Serverless Function (Node 18+)
// Endpoint del cuestionario pre-Express (W3 + W9 + W19).
// Procesa POST con las 10 preguntas, decide 1 de 3 ramas y dispara:
//   Rama 1 (spam evidente)         → log silencioso, sin email
//   Rama 2 (Q5 < 80K facturación)  → autoresponse Plantilla 2 al lead + email interno a Diego
//   Rama 3 (resto)                 → autoresponse Plantilla 1 al lead + email interno a Diego
//
// Sin dependencias npm — usa fetch global (Node 18+) contra la API REST de Resend.
// Lógica de ramas + textos en agencia/servicios/aionaudit/cuestionario-pre-express.md
// + email-confirmacion-express.md del repo business-os.

'use strict';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const FROM      = 'Aion Studio <hello@aionstudio.tech>';
const REPLY_TO  = 'diego@aionstudio.tech';
const TO_INTERN = 'diego@aionstudio.tech';

// Dominios de email descartables conocidos (spam evidente).
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com','10minutemail.com','tempmail.com','temp-mail.org','guerrillamail.com',
  'sharklasers.com','trashmail.com','yopmail.com','throwawaymail.com','fakeinbox.com',
  'dispostable.com','maildrop.cc','getairmail.com','mintemail.com','spam4.me',
]);

// Rate limit naïve in-memory (sobrevive mientras la función está caliente).
// 3 envíos / IP / hora. En F0-F1 con poco tráfico es suficiente; el honeypot
// + detección de spam por contenido cubre el grueso.
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const rateBucket = new Map(); // ip → [timestamp, timestamp, ...]

function isRateLimited(ip) {
  const now = Date.now();
  const arr = (rateBucket.get(ip) || []).filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  if (arr.length >= RATE_LIMIT_MAX) {
    rateBucket.set(ip, arr);
    return true;
  }
  arr.push(now);
  rateBucket.set(ip, arr);
  return false;
}

function isValidEmail(s) {
  return typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function isDisposable(email) {
  const dom = String(email).split('@')[1]?.toLowerCase();
  return !!dom && DISPOSABLE_DOMAINS.has(dom);
}

function looksRandom(s) {
  if (!s) return false;
  const v = String(s).trim().toLowerCase();
  if (v.length < 3) return true;
  // strings sin vocales o secuencias de teclado típicas
  if (!/[aeiouáéíóúàèìòùâêîôû]/i.test(v)) return true;
  if (/^(asdf|qwer|test|prueba|aaaa|bbbb|1234)/.test(v)) return true;
  return false;
}

// Rama 1 del cuestionario-pre-express.md §"Lógica auto-respuesta"
function detectSpam(payload) {
  if (isDisposable(payload.q2_email)) return 'disposable_email';
  if (looksRandom(payload.q1_nombre))   return 'random_name';
  if (looksRandom(payload.q1_empresa))  return 'random_company';
  const dolor = String(payload.q7_dolor || '').trim().toLowerCase();
  if (!dolor || dolor === 'test' || dolor === 'prueba' || dolor.length < 10) return 'empty_or_test_pain';
  return null;
}

// Detecta red flags universales 1.1-1.7 (mapping del cuestionario §"Mapping pregunta → red flag")
function detectRedFlags(p) {
  const flags = [];
  // 1.1 — facturación <150K (sin descalificación; nota para Diego)
  if (p.q5_facturacion === '<80K')         flags.push('1.1 Facturación <80K — rama 2 advertencia disparada');
  else if (p.q5_facturacion === '80-150K') flags.push('1.1 Facturación 80-150K — zona gris');
  // 1.3 — decisor múltiple
  if (p.q6_decisor === 'committee') flags.push('1.3 Decisor: comité — profundizar en Express');
  if (p.q6_decisor === 'other')     flags.push('1.3 Decisor: otra persona — verificar acceso real');
  // 2.10 — clínica dental con 1 profesional
  if (p.q3_sector === 'dental' && p.q4_empleados === '1') {
    flags.push('2.10 Clínica dental con 1 profesional — red flag pura');
  }
  // 2.7 — médica FR detectada (no en lista, pero el "otro" puede traerla)
  const otroLower = String(p.q3_sector_otro || '').toLowerCase();
  if (p.q3_sector === 'other' && /m[ée]dec|m[ée]dic|gp\b|doctor/.test(otroLower)) {
    flags.push('2.7 Sector "otro" parece médica — verificar HDS si es FR');
  }
  // 1.6 — urgencia <1 mes con dolor vago
  if (p.q10_urgencia === 'asap' && String(p.q7_dolor || '').trim().length < 60) {
    flags.push('1.6 Urgencia <1 mes con dolor vago — posible urgencia mal sana');
  }
  // 2.9 — exploración pasiva
  if (p.q10_urgencia === 'exploring' && String(p.q7_dolor || '').trim().length < 60) {
    flags.push('2.9 Sin urgencia + dolor vago — exploración pasiva');
  }
  return flags;
}

// Primer token del nombre completo (Q1) para personalizar plantilla.
function firstName(full) {
  const t = String(full || '').trim().split(/\s+/)[0] || '';
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/* ============================================================
   PLANTILLAS DE EMAIL — ES + FR + EN
   Fuente de verdad en business-os agencia/servicios/aionaudit/email-confirmacion-express.md
   Cualquier cambio aquí debe replicarse allí.
   ============================================================ */

const SUBJECTS = {
  plantilla1: {
    es: 'Hemos recibido tu cuestionario — siguiente paso',
    fr: 'Nous avons reçu votre questionnaire — prochaine étape',
    en: 'We\'ve received your questionnaire — next step',
  },
  plantilla2: {
    es: 'Hemos recibido tu cuestionario — antes de agendar, un apunte',
    fr: 'Nous avons reçu votre questionnaire — avant de fixer un créneau, une précision',
    en: 'We\'ve received your questionnaire — a note before we schedule',
  },
};

function bodyPlantilla1(lang, name) {
  if (lang === 'fr') return `Bonjour ${name},

Merci d'avoir envoyé le questionnaire. Je l'ai reçu et je vais le revoir personnellement dans les prochaines heures.

Voici ce qui se passe maintenant :

1. Je relis ce que vous m'avez raconté et je prépare la conversation.
2. Je vous écris sous 24h ouvrées avec deux options :
   — Si je vois qu'il y a du sens à continuer, je vous propose trois créneaux concrets pour l'appel de 30 minutes.
   — Si à la lecture de votre questionnaire je vois qu'Aion n'est pas le meilleur fit pour vous, je vous le dis directement et je vous oriente vers ce qui le serait, sans vous faire perdre du temps ni m'en faire perdre.

L'appel se fait en visioconférence (Google Meet), il est gratuit, et à la fin nous repartons avec un rapport court d'une page qui vous arrive sous 24h avec ce que j'ai observé et les pistes possibles.

Si entre-temps vous avez quelque chose à ajouter au questionnaire, répondez simplement à ce mail.

Cordialement,
Diego Camiña Alonso
Aion Studio
aionstudio.tech`;

  if (lang === 'en') return `Hi ${name},

Thanks for sending the questionnaire. I've received it and I'll personally review it in the next few hours.

Here's what happens next:

1. I read through what you've told me and prepare the conversation.
2. I'll write to you within 24 working hours with two options:
   — If I see it makes sense to continue, I'll propose three concrete slots for the 30-minute call.
   — If from your questionnaire I see that Aion isn't the best fit for you, I'll tell you directly and point you towards something that would be, without wasting your time or mine.

The call is by video (Google Meet), free of charge, and at the end you'll receive a short one-page report within 24h with what I've observed and the possible paths forward.

If in the meantime you have anything to add to the questionnaire, just reply to this email.

Best,
Diego Camiña Alonso
Aion Studio
aionstudio.tech`;

  // ES por defecto
  return `Hola ${name},

Gracias por enviar el cuestionario. Lo he recibido y voy a revisarlo personalmente en las próximas horas.

Lo que pasa ahora:

1. Reviso lo que me cuentas y preparo la conversación.
2. Te escribo en menos de 24h laborables con dos opciones:
   — Si veo que tiene sentido seguir, te propongo tres horarios concretos para la llamada de 30 minutos.
   — Si por lo que cuentas veo que Aion no es el mejor encaje para ti, te lo digo directo y te oriento hacia algo que sí lo sea, sin perder tu tiempo ni el mío.

La llamada es por videoconferencia (Google Meet), gratuita, y al final salimos con un informe corto de una página que te llega en 24h con lo que he visto y los caminos posibles.

Si entre tanto te surge algo que añadir al cuestionario, respóndeme a este mismo correo.

Un saludo,
Diego Camiña Alonso
Aion Studio
aionstudio.tech`;
}

function bodyPlantilla2(lang, name) {
  if (lang === 'fr') return `Bonjour ${name},

Merci d'avoir envoyé le questionnaire. Je l'ai reçu et je vais le revoir personnellement.

Avant de vous proposer un horaire pour l'appel, je vous explique un détail ouvertement pour que vous décidiez en toute connaissance de cause :

Nos tarifs actuels sont pensés pour des entreprises à partir d'environ 150.000 € de chiffre d'affaires annuel. La raison est structurelle — les services récurrents que nous proposons (entre 150 € et 500 € par mois selon la brique) représenteraient dans votre cas un pourcentage de votre chiffre d'affaires plus élevé que ce qui est typiquement soutenable pour une TPE, et l'expérience nous dit que cela génère une tension à moyen terme dans la maintenance.

Cela ne signifie PAS que votre entreprise n'a pas de vrais problèmes que nous pourrions résoudre techniquement. Cela signifie que l'encadrement économique aujourd'hui est difficile. Il y a deux chemins honnêtes :

1. Vous voulez quand même fixer un créneau. Si votre cas a quelque chose de concret (une marge élevée, un problème très spécifique, une urgence réelle), répondez à ce mail en me le disant et nous fixons l'appel de 30 minutes sans coût. Nous l'abordons ouvertement.

2. Vous préférez attendre. Si après avoir lu ceci vous pensez qu'il a plus de sens de revenir quand votre entreprise aura grandi, je vous note dans mon système et je vous recontacte moi-même au bon moment — sans démarches administratives de votre côté.

Sans pression. Ce que vous déciderez sera bien.

Cordialement,
Diego Camiña Alonso
Aion Studio
aionstudio.tech`;

  if (lang === 'en') return `Hi ${name},

Thanks for sending the questionnaire. I've received it and I'll personally review it.

Before proposing a time for the call, I want to be transparent about one detail so you can decide with full information:

Our current pricing is designed for companies starting from around €150,000 in annual revenue. The reason is structural — the recurring services we offer (between €150 and €500 per month per piece) would, in your case, represent a higher percentage of your revenue than is typically sustainable for a small business, and experience tells us that this generates tension in the medium-term maintenance.

This does NOT mean your business doesn't have real pain points we could technically solve. It means the economic fit today is difficult. There are two honest paths:

1. You still want to schedule. If your case has something concrete (a high margin, a very specific problem, real urgency), reply to this email letting me know and we'll book the 30-minute call at no cost. We'll discuss it openly.

2. You'd prefer to wait. If after reading this you think it makes more sense to come back when your business has grown, I'll note you in my system and reach out myself when the time is right — no admin on your side.

No pressure. Whatever you decide is fine.

Best,
Diego Camiña Alonso
Aion Studio
aionstudio.tech`;

  // ES
  return `Hola ${name},

Gracias por enviar el cuestionario. Lo he recibido y voy a revisarlo personalmente.

Antes de proponer horario para la llamada, te explico un detalle abiertamente para que decidas con la información completa:

Nuestro pricing actual está pensado para empresas a partir de unos 150.000 € de facturación anual. La razón es estructural — los servicios recurrentes que ofrecemos (entre 150 € y 500 € al mes según pieza) representarían en tu caso un porcentaje de tu facturación más alto del que típicamente es sostenible para una pyme, y la experiencia nos dice que eso genera tensión a medio plazo en el mantenimiento.

Eso NO significa que tu negocio no tenga dolores reales que podríamos resolver técnicamente. Significa que el encaje económico hoy es difícil. Hay dos caminos honestos:

1. Sí quieres agendar igualmente. Si tu caso tiene algo concreto (un margen alto, un problema muy específico, una urgencia real), respóndeme a este correo diciéndolo y agendamos la llamada de 30 minutos sin coste. Lo vemos abierto.

2. Prefieres esperar. Si tras leer esto piensas que tiene más sentido retomar cuando tu negocio haya crecido, te apunto en mi sistema y te contacto yo cuando llegue ese momento — sin pasos administrativos por tu parte.

Sin presión. Lo que decidas está bien.

Un saludo,
Diego Camiña Alonso
Aion Studio
aionstudio.tech`;
}

// Email interno estructurado a Diego — diseñado para análisis en 30 segundos.
function buildInternalEmail(p, branch, flags, ip) {
  const sector = p.q3_sector === 'other' ? `Otro: ${p.q3_sector_otro || '(sin especificar)'}` : p.q3_sector;
  const flagsBlock = flags.length
    ? '\n🚩 RED FLAGS DETECTADAS:\n' + flags.map(f => '  • ' + f).join('\n') + '\n'
    : '\n✓ Sin red flags automáticas.\n';
  return `╔══════════════════════════════════════════════════════════════╗
║  CUESTIONARIO PRE-EXPRESS · ${p.lang.toUpperCase()} · Rama ${branch.id} (${branch.label})
╚══════════════════════════════════════════════════════════════╝
${flagsBlock}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Q1 — IDENTIDAD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Nombre:    ${p.q1_nombre}
  Empresa:   ${p.q1_empresa}
  Cargo:     ${p.q1_cargo}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Q2 — CONTACTO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Email:     ${p.q2_email}
  Teléfono:  ${p.q2_telefono || '(no facilitado)'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEGOCIO · DECISIÓN · URGENCIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Q3 Sector:        ${sector}
  Q4 Empleados:     ${p.q4_empleados}
  Q5 Facturación:   ${p.q5_facturacion}
  Q6 Decisor:       ${p.q6_decisor}
  Q10 Urgencia:     ${p.q10_urgencia}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Q7 — DOLOR PRINCIPAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${p.q7_dolor}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Q8 — OTROS PROCESOS A AUTOMATIZAR (opcional)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${p.q8_otros || '(no respondido)'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Q9 — STACK ACTUAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${p.q9_stack}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
METADATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Idioma del form:  ${p.lang}
  Rama aplicada:    ${branch.id} (${branch.label})
  Autoresponse:     ${branch.template}
  IP origen:        ${ip}
  Timestamp:        ${new Date().toISOString()}

— Responde a este email para contestar directamente a ${p.q2_email} —
`;
}

async function sendResend(payload, apiKey) {
  const r = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const body = await r.text().catch(() => '');
    throw new Error(`resend_${r.status}: ${body.slice(0, 200)}`);
  }
  return r.json();
}

/* ============================================================
   HANDLER
   ============================================================ */

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const p = req.body || {};

  // 1. Honeypot — si el campo oculto "website" llega relleno, es bot. Aceptamos en silencio.
  if (typeof p.website === 'string' && p.website.trim()) {
    console.log('[contact] honeypot triggered');
    return res.status(200).json({ ok: true });
  }

  // 2. Validación de idioma
  const lang = ['es', 'fr', 'en'].includes(p.lang) ? p.lang : 'es';
  p.lang = lang;

  // 3. Validación de campos obligatorios
  const required = ['q1_nombre','q1_empresa','q1_cargo','q2_email','q3_sector',
                    'q4_empleados','q5_facturacion','q6_decisor','q7_dolor','q9_stack','q10_urgencia'];
  for (const k of required) {
    if (!p[k] || String(p[k]).trim() === '') {
      return res.status(400).json({ error: 'missing_field', field: k });
    }
  }
  if (p.q3_sector === 'other' && !String(p.q3_sector_otro || '').trim()) {
    return res.status(400).json({ error: 'missing_field', field: 'q3_sector_otro' });
  }

  // 4. Email válido
  if (!isValidEmail(p.q2_email)) {
    return res.status(400).json({ error: 'invalid_email' });
  }

  // 5. Rate limit
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (isRateLimited(ip)) {
    console.log('[contact] rate-limited', ip);
    return res.status(200).json({ ok: true }); // silent fail
  }

  // 6. Detección de spam — Rama 1 del cuestionario
  const spamReason = detectSpam(p);
  if (spamReason) {
    console.log('[contact] spam discarded', { reason: spamReason, ip, email: p.q2_email });
    return res.status(200).json({ ok: true });
  }

  // 7. Detección de rama
  const branch = p.q5_facturacion === '<80K'
    ? { id: 2, label: 'Advertencia <80K', template: 'Plantilla 2' }
    : { id: 3, label: 'Caso normal',     template: 'Plantilla 1' };

  // 8. Red flags
  const flags = detectRedFlags(p);

  // 9. Comprobar API key
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('[contact] RESEND_API_KEY not set — logging lead and returning OK to user');
    console.log('[lead-no-key]', JSON.stringify(p));
    return res.status(200).json({ ok: true });
  }

  // 10. Construir emails
  const name = firstName(p.q1_nombre);
  const leadBody = branch.id === 2 ? bodyPlantilla2(lang, name) : bodyPlantilla1(lang, name);
  const leadSubject = branch.id === 2 ? SUBJECTS.plantilla2[lang] : SUBJECTS.plantilla1[lang];
  const internalBody = buildInternalEmail(p, branch, flags, ip);
  const facturacionEmoji = p.q5_facturacion === '<80K' ? '🟡' : (p.q5_facturacion === '>1M' || p.q5_facturacion === '350K-1M' ? '🔴' : '⚪');
  const internalSubject = `${facturacionEmoji} [Cuestionario · ${lang.toUpperCase()}] ${p.q1_empresa} — ${p.q3_sector === 'other' ? p.q3_sector_otro : p.q3_sector} · ${p.q5_facturacion}${flags.length ? ' · ⚠️' + flags.length : ''}`;

  // 11. Disparar emails
  try {
    await Promise.all([
      sendResend({
        from: FROM,
        to: [p.q2_email],
        reply_to: REPLY_TO,
        subject: leadSubject,
        text: leadBody,
      }, apiKey),
      sendResend({
        from: FROM,
        to: [TO_INTERN],
        reply_to: p.q2_email,
        subject: internalSubject,
        text: internalBody,
      }, apiKey),
    ]);
    return res.status(200).json({ ok: true });
  } catch (err) {
    // Si Resend falla, devolvemos OK al usuario y logueamos el lead íntegro para recuperarlo manualmente.
    console.error('[contact] resend error', err.message);
    console.log('[lead-failed-resend]', JSON.stringify(p));
    return res.status(200).json({ ok: true });
  }
}
