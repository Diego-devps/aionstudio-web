# CLAUDE.md — Aion Studio Web

## Proyecto
Web corporativa de Aion Studio. HTML + CSS + JS vanilla con **build script Node nativo** para multilingüe nativo (ES/FR/EN como URLs físicas). Sin frameworks. Deploy en Vercel.

## Reglas de seguridad
- READ-ONLY por defecto: no borres ningún archivo sin confirmación explícita
- No instales dependencias npm sin explicar qué hacen y pedir confirmación
- No accedas ni modifiques archivos `.env`, `.ssh`, ni credenciales
- Siempre haz commit antes de cambios grandes
- No hagas push automático sin confirmación

## Stack
- HTML5 semántico
- CSS3 con variables custom (sin frameworks)
- JS vanilla (sin jQuery, sin React)
- **Build:** Node.js >=18, módulos nativos (`fs`, `path`) — cero dependencias npm
- Fuente: Inter (Google Fonts)
- Deploy: Vercel — `buildCommand: npm run build`, `outputDirectory: dist`

## Estructura del repo
```
aionstudio-web/
├── src/
│   ├── index.html              ← plantilla home con marcadores {{...}} y data-i18n
│   ├── auditoria.html          ← plantilla /auditoria/ (cuestionario pre-Express)
│   ├── translations.js         ← objeto ES/FR/EN (fuente única de copy para home y auditoria)
│   └── blog/
│       ├── es/                 ← 5 archivos monolingües ES (index + 4 entradas)
│       ├── fr/                 ← 5 archivos monolingües FR (slugs nativos)
│       └── en/                 ← 5 archivos monolingües EN (slugs nativos)
├── scripts/
│   └── build.js                ← generador estático (lee src/ → escribe dist/)
├── css/styles.css              ← copiado a dist/css/ por el build
├── js/main.js                  ← copiado a dist/js/ por el build
├── assets/img/                 ← copiado a dist/assets/
├── privacidad/, terminos/, cookies/, subvenciones/  ← copiado tal cual
├── favicon.png, favicon.svg, sitemap.xml            ← idem
├── package.json                ← npm scripts (sin deps)
├── vercel.json                 ← config de deploy
├── .gitignore                  ← excluye dist/, node_modules/, .env*
└── dist/                       ← OUTPUT del build (no commit, lo genera Vercel)
    ├── index.html              ← ES home
    ├── auditoria/index.html
    ├── blog/                   ← ES blog (5 archivos)
    ├── fr/                     ← FR home + auditoria + blog
    ├── en/                     ← EN home + auditoria + blog
    └── [resto de assets copiados]
```

## Build local
```bash
npm run build         # genera dist/
npm run dev           # build + sirve dist/ en localhost:3000 (usa npx serve)
```

El build:
1. Lee `src/translations.js` (objeto con claves ES/FR/EN).
2. Lee `src/index.html` (plantilla con `{{MARKER}}` y `data-i18n="key"`).
3. Para cada idioma sustituye marcadores estructurales (lang, canonical, hreflang, og:locale, lang-toggle) y traduce el contenido `data-i18n`.
4. Escribe a `dist/index.html` (ES), `dist/fr/index.html`, `dist/en/index.html`.
5. Copia assets estáticos a `dist/`.

## Idiomas
**Multilingüe nativo** desde sesión 7.4a (cambio W12 Camino B):
- ES en `/`, FR en `/fr/`, EN en `/en/` — URLs físicas, no toggle JS.
- `<html lang>` correcto por idioma.
- `<link rel="canonical">` apunta a la URL del idioma actual.
- `<link rel="alternate" hreflang>` correcto + `x-default` → ES.
- `<meta property="og:locale">` por idioma + `og:locale:alternate` cruzados.
- Toggle ES/FR/EN del navbar = `<a href>` a la URL correspondiente (no JS).
- Form lleva `<input type="hidden" name="lang" value="es|fr|en">` para que el endpoint detecte idioma del prospect.

## Paleta de colores (PENDIENTE refactor en 7.4b — W15)
- Fondo principal: `#0a0a14`
- Fondo secundario: `#0f0f1e`
- Cyan principal: `#00d4ff` (W15 lo cambiará a blanco/negro/crema)
- Cyan hover: `#00b8d9`
- Texto principal: `#ffffff`
- Texto secundario: `#8892a4`

## Secciones home (orden actual)
1. Nav — logo + links + selector ES/FR/EN (URLs físicas) + CTA "Auditoría Gratuita" → `/auditoria/`
2. Hero — headline + subtítulo + 2 CTAs + canvas con malla cyan animada
3. Propuesta de valor (W23 aplicada 23/05) — 4 cards verificables: 24/7 · <2s voz · sin intermediarios · compliance EU
4. Servicios — grid 2x2: 4 cards con titulares públicos (W14 aplicada 7.4a Bloque 3)
5. Misión y Visión — texto + foto fundador
6. Proceso 4 pasos — Auditoría Express → Profunda → Implementación → Soporte (W21 aplicada 7.4a Bloque 3)
7. CTA Auditoría Express — card grande con link a `/auditoria/` (reemplazó form Formspree en 7.4a Bloque 2)
8. Footer — links + legal + ubicación + redes

## Página /auditoria (W3 + W9 + W19 aplicadas 7.4a Bloque 2)
- Template propia `src/auditoria.html` procesada por el build → `/auditoria/`, `/fr/auditoria/`, `/en/auditoria/`.
- Cuestionario pre-Express de 10 preguntas con UX móvil-first.
- Form postea JSON a `/api/contact` (Vercel Serverless Function).
- Honeypot anti-bot + detección spam por contenido + rate limit 3/IP/h.
- Branching: Q5 = "<80K" → Plantilla 2 (advertencia transparente). Resto → Plantilla 1 (confirmación estándar). Spam evidente → log silencioso.
- Fuente de verdad copy: `business-os/agencia/servicios/aionaudit/cuestionario-pre-express.md` + `email-confirmacion-express.md`.

## Animaciones
- Cards de servicios: borde cyan al hover
- Hero: malla geométrica animada (canvas, partículas + conexiones)
- Nav: sticky con blur al hacer scroll
- Fade-in al entrar en viewport (servicios, mision-block, founder-card)

## Blog trilingüe (7.4a.bis)

5 páginas × 3 idiomas físicos = 15 URLs publicadas:

- ES: `/blog/`, `/blog/ia-para-clinicas-dentales.html`, `/blog/ia-para-gestorias.html`, `/blog/recepcionista-3am.html`, `/blog/6-tareas-ia.html`
- FR: `/fr/blog/`, `/fr/blog/ia-pour-cabinets-dentaires.html`, `/fr/blog/ia-pour-cabinets-comptables.html`, `/fr/blog/receptionniste-3h-du-matin.html`, `/fr/blog/6-taches-ia.html`
- EN: `/en/blog/`, `/en/blog/ai-for-dental-clinics.html`, `/en/blog/ai-for-accounting-firms.html`, `/en/blog/receptionist-at-3am.html`, `/en/blog/6-tasks-ai.html`

**Cada archivo fuente es monolingüe** (no hay `data-lang-content` ni toggle JS). El build script inyecta marcadores estructurales comunes (`{{LANG}}`, `{{LANG_TOGGLE}}`, `{{HREFLANG_BLOCK}}`, `{{HOME_URL}}`, `{{AUDITORIA_URL}}`, `{{BLOG_URL}}`, `{{CANONICAL_URL}}`, `{{OG_LOCALE}}`, `{{OG_LOCALE_ALTERNATES}}`).

El mapping ES↔FR↔EN de slugs vive en `scripts/build.js` (constante `BLOG_POSTS`). Para añadir una entrada nueva: leer `src/blog/CONTRIBUTING.md` (protocolo paso a paso). El build solo genera entradas cuyo archivo fuente exista — si falta una traducción, se skipea con warning sin romper el build.

**Wording de marca interna en blog narrativo**: las menciones a AionVoice/AionFlow/AionInbox dentro del cuerpo de un artículo del blog **se mantienen** (decisión 7.4a.bis). Refuerza familiaridad en contenido educativo profundo. W14 (sustitución por títulos públicos) sólo aplica a cards de servicios en la home — no al blog narrativo.

## Endpoint del formulario
**`/api/contact`** — Vercel Serverless Function (Node 18+, CommonJS, sin deps npm) llamando a la API REST de Resend vía `fetch` nativo. Procesa POST con las 10 preguntas del cuestionario pre-Express y dispara:
- Autoresponse al lead (Plantilla 1 estándar o Plantilla 2 advertencia <80K, en idioma detectado).
- Email interno estructurado a `diego@aionstudio.tech` con resumen + red flags auto-detectadas + rama aplicada.
- Si Resend falla, devuelve OK al usuario y loguea el lead íntegro en consola Vercel para recuperación manual.

**Env vars requeridas:** `RESEND_API_KEY` (Sensitive ON, Production+Preview).
**Remitente:** `Aion Studio <hello@aionstudio.tech>` (alias en Hostinger → reenvía al buzón `diego@aionstudio.tech` que reenvía a Gmail personal).
**Reply-To:** `diego@aionstudio.tech` (cuando el lead pulsa Responder, llega directo a Diego).
