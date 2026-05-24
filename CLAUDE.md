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
│   ├── index.html        ← plantilla con marcadores {{...}} y data-i18n
│   └── translations.js   ← objeto ES/FR/EN (fuente única de copy)
├── scripts/
│   └── build.js          ← generador estático (lee src/ → escribe dist/)
├── css/styles.css        ← copiado a dist/css/ por el build
├── js/main.js            ← copiado a dist/js/ por el build
├── assets/img/           ← copiado a dist/assets/
├── blog/                 ← copiado tal cual (no pasa por el build script)
├── privacidad/, terminos/, cookies/, subvenciones/  ← idem
├── favicon.png, favicon.svg, sitemap.xml            ← idem
├── package.json          ← npm scripts (sin deps)
├── vercel.json           ← config de deploy
├── .gitignore            ← excluye dist/, node_modules/, .env*
└── dist/                 ← OUTPUT del build (no commit, lo genera Vercel)
    ├── index.html        ← ES (raíz)
    ├── fr/index.html     ← FR
    ├── en/index.html     ← EN
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
1. Nav — logo + links + selector ES/FR/EN (URLs físicas) + CTA "Auditoría Gratuita"
2. Hero — headline + subtítulo + 2 CTAs + canvas con malla cyan animada
3. Propuesta de valor (W23 aplicada 23/05) — 4 cards verificables: 24/7 · <2s voz · sin intermediarios · compliance EU
4. Servicios — grid 2x2: AionVoice, AionFlow, AionInbox, Web IA
5. Misión y Visión — texto + foto fundador
6. Formulario — "Agenda tu Auditoría" (endpoint Formspree, migra a `/api/contact` en bloque 2)
7. Footer — links + legal + ubicación + redes

## Animaciones
- Cards de servicios: borde cyan al hover
- Hero: malla geométrica animada (canvas, partículas + conexiones)
- Nav: sticky con blur al hacer scroll
- Fade-in al entrar en viewport (servicios, mision-block, founder-card)

## Endpoint del formulario
- **Actual (legado):** Formspree `https://formspree.io/f/xaqpeawy`.
- **Próximo (bloque 2 sesión 7.4a):** `/api/contact` Vercel Serverless Function + Resend (envío interno + autoresponse bilingüe + branching por banda de facturación). Requiere `RESEND_API_KEY` en env vars de Vercel.
