#!/usr/bin/env node
// scripts/build.js — generador estático multilingüe (Camino B, W12+W11+W26+W7 + blog trilingüe 7.4a.bis)
// Lee src/index.html + src/auditoria.html + src/blog/[lang]/*.html + src/translations.js
// → produce dist/{,fr/,en/}/{index.html, auditoria/index.html, blog/*.html}
// Cero deps externas: solo módulos nativos de Node (fs, path).

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

const TEMPLATE_HOME = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8');
const TEMPLATE_AUDITORIA = fs.readFileSync(path.join(SRC, 'auditoria.html'), 'utf8');
const TEMPLATE_PROFUNDA = fs.readFileSync(path.join(SRC, 'auditoria-profunda.html'), 'utf8');
const TEMPLATE_SUBVENCIONES = fs.readFileSync(path.join(SRC, 'subvenciones.html'), 'utf8');
const TRANSLATIONS = require(path.join(SRC, 'translations.js'));

const SITE_URL = 'https://aionstudio.tech';

// idioma → { pathPrefix, ogLocale, alternates }
const LOCALES = {
  es: { path: '',     ogLocale: 'es_ES', alternates: ['fr_FR', 'en_GB'] },
  fr: { path: 'fr/',  ogLocale: 'fr_FR', alternates: ['es_ES', 'en_GB'] },
  en: { path: 'en/',  ogLocale: 'en_GB', alternates: ['es_ES', 'fr_FR'] },
};

const LANG_ORDER = ['es', 'fr', 'en'];
const LANG_LABEL = { es: 'ES', fr: 'FR', en: 'EN' };
const LANG_PATH  = { es: '/',  fr: '/fr/', en: '/en/' };
const AUDITORIA_PATH = { es: '/auditoria/', fr: '/fr/auditoria/', en: '/en/auditoria/' };
const PROFUNDA_PATH = { es: '/auditoria-profunda/', fr: '/fr/auditoria-profunda/', en: '/en/auditoria-profunda/' };
const SUBVENCIONES_PATH = { es: '/subvenciones/', fr: '/fr/subvenciones/', en: '/en/subvenciones/' };
const BLOG_PATH = { es: '/blog/', fr: '/fr/blog/', en: '/en/blog/' };

// Páginas legales (estáticas, fuera del sistema data-i18n). ES en /<slug>/, FR en /fr/<slug>/.
// Fuente: <slug>/index.html (ES) + <slug>/index.fr.html (FR). EN no tiene página propia → cae a la ES.
const LEGAL_SLUGS = ['privacidad', 'aviso-legal', 'terminos', 'cookies'];
const LEGAL_LINK_KEYS = {
  privacidad: 'footer_privacy',
  'aviso-legal': 'footer_legal_notice',
  terminos: 'footer_terms',
  cookies: 'footer_cookies',
};

// HTML de los enlaces legales del footer, resuelto por idioma (URL + etiqueta traducida).
// es → /<slug>/ · fr → /fr/<slug>/ · en → /en/<slug>/
function buildLegalLinks(lang) {
  const t = TRANSLATIONS[lang];
  const prefix = lang === 'es' ? '' : '/' + lang;
  return LEGAL_SLUGS
    .map(slug => `<a href="${prefix}/${slug}/">${t[LEGAL_LINK_KEYS[slug]]}</a>`)
    .join('\n          ');
}

// WhatsApp por idioma (W18). ES y EN → número +34; FR → número +33.
const WHATSAPP = {
  es: { number: '34697554025', message: 'Hola, me gustaría información sobre Aion Studio' },
  fr: { number: '33695325662', message: 'Bonjour, je voudrais des informations sur Aion Studio' },
  en: { number: '34697554025', message: "Hi, I'd like information about Aion Studio" },
};
function buildWhatsappHref(lang) {
  const w = WHATSAPP[lang] || WHATSAPP.es;
  return 'https://wa.me/' + w.number + '?text=' + encodeURIComponent(w.message);
}

// Páginas top-level a generar.
const PAGES = [
  { name: 'home',                template: TEMPLATE_HOME,      outFile: 'index.html',                       seoPrefix: '' },
  { name: 'auditoria',           template: TEMPLATE_AUDITORIA, outFile: 'auditoria/index.html',             seoPrefix: 'aud_' },
  { name: 'auditoria-profunda',  template: TEMPLATE_PROFUNDA,  outFile: 'auditoria-profunda/index.html',    seoPrefix: 'prof_' },
  { name: 'subvenciones',        template: TEMPLATE_SUBVENCIONES, outFile: 'subvenciones/index.html',       seoPrefix: 'sub_' },
];

// Posts del blog. Cada post tiene un id estable + slug por idioma (sin .html, sin paths).
// Cuando se añada un post nuevo, ampliar este array Y crear el archivo en cada src/blog/[lang]/[slug].html.
// El archivo 'index' del listado se trata como caso especial (mismo slug en todos los idiomas).
const BLOG_POSTS = [
  {
    id: 'clinicas-dentales',
    slugs: { es: 'ia-para-clinicas-dentales', fr: 'ia-pour-cabinets-dentaires', en: 'ai-for-dental-clinics' },
  },
  {
    id: 'gestorias',
    slugs: { es: 'ia-para-gestorias', fr: 'ia-pour-cabinets-comptables', en: 'ai-for-accounting-firms' },
  },
  {
    id: 'recepcionista',
    slugs: { es: 'recepcionista-3am', fr: 'receptionniste-3h-du-matin', en: 'receptionist-at-3am' },
  },
  {
    id: 'tareas-ia',
    slugs: { es: '6-tareas-ia', fr: '6-taches-ia', en: '6-tasks-ai' },
  },
];

/* ------------------------------------------------------------------
   Helpers — top-level pages
   ------------------------------------------------------------------ */

// Construye el toggle ES/FR/EN. Si pageName === 'auditoria', el toggle apunta a /[lang/]auditoria/.
function buildLangToggle(activeLang, pageName) {
  const pathMap = pageName === 'auditoria' ? AUDITORIA_PATH
    : pageName === 'auditoria-profunda' ? PROFUNDA_PATH
    : pageName === 'subvenciones' ? SUBVENCIONES_PATH
    : LANG_PATH;
  return LANG_ORDER.map(l => {
    const isActive = l === activeLang;
    const cls = 'lang-btn' + (isActive ? ' active' : '');
    const aria = isActive ? ' aria-current="page"' : '';
    return `<a href="${pathMap[l]}" class="${cls}" hreflang="${l}"${aria}>${LANG_LABEL[l]}</a>`;
  }).join('\n          ');
}

function buildOgAlternates(altLocales) {
  return altLocales.map(loc =>
    `<meta property="og:locale:alternate" content="${loc}" />`
  ).join('\n  ');
}

function applyStructuralReplacements(html, lang, page) {
  const loc = LOCALES[lang];
  const t = TRANSLATIONS[lang];
  // SEO específico por página: home usa meta_*, auditoria usa aud_meta_*
  const metaTitle = page.seoPrefix
    ? t[page.seoPrefix + 'meta_title']       || t.meta_title
    : t.meta_title;
  const metaDesc  = page.seoPrefix
    ? t[page.seoPrefix + 'meta_description'] || t.meta_description
    : t.meta_description;
  const metaKw    = page.seoPrefix
    ? t[page.seoPrefix + 'meta_keywords']    || t.meta_keywords
    : t.meta_keywords;
  const canonicalBase = page.name === 'auditoria'
    ? SITE_URL + AUDITORIA_PATH[lang]
    : page.name === 'auditoria-profunda'
    ? SITE_URL + PROFUNDA_PATH[lang]
    : page.name === 'subvenciones'
    ? SITE_URL + SUBVENCIONES_PATH[lang]
    : SITE_URL + '/' + loc.path;

  const replacements = {
    '{{LANG}}': lang,
    '{{META_TITLE}}': escapeAttr(metaTitle),
    '{{META_DESCRIPTION}}': escapeAttr(metaDesc),
    '{{META_KEYWORDS}}': escapeAttr(metaKw),
    '{{SCHEMA_DESCRIPTION}}': escapeJson(t.schema_description),
    '{{CANONICAL_URL}}': canonicalBase,
    '{{OG_LOCALE}}': loc.ogLocale,
    '{{OG_LOCALE_ALTERNATES}}': buildOgAlternates(loc.alternates),
    '{{HOME_URL}}': LANG_PATH[lang],
    '{{AUDITORIA_URL}}': AUDITORIA_PATH[lang],
    '{{PROFUNDA_URL}}': PROFUNDA_PATH[lang],
    '{{BLOG_URL}}': BLOG_PATH[lang],
    '{{LANG_TOGGLE}}': buildLangToggle(lang, page.name),
    '{{LEGAL_LINKS}}': buildLegalLinks(lang),
    '{{NAV_MENU_OPEN}}': escapeAttr(t.nav_menu_open),
    '{{WHATSAPP_HREF}}': buildWhatsappHref(lang),
  };

  for (const [marker, value] of Object.entries(replacements)) {
    html = html.split(marker).join(value);
  }

  return html;
}

function applyI18nReplacements(html, lang) {
  const t = TRANSLATIONS[lang];

  // 1. data-i18n="key">contenido</tag>  → reemplaza contenido + quita atributo
  //    El regex captura tags balanceados sin anidamiento del mismo tag.
  html = html.replace(
    /<([a-zA-Z][a-zA-Z0-9]*)([^>]*?)\sdata-i18n="([^"]+)"([^>]*)>([\s\S]*?)<\/\1>/g,
    (match, tag, attrsBefore, key, attrsAfter, oldContent) => {
      const value = t[key];
      if (value === undefined) {
        console.warn(`[build] missing translation key "${key}" for lang "${lang}"`);
        return match;
      }
      return `<${tag}${attrsBefore}${attrsAfter}>${value}</${tag}>`;
    }
  );

  // 2. data-i18n-placeholder="key"  →  placeholder="value"
  html = html.replace(
    /\sdata-i18n-placeholder="([^"]+)"/g,
    (match, key) => {
      const value = t[key];
      if (value === undefined) {
        console.warn(`[build] missing translation key "${key}" for lang "${lang}"`);
        return match;
      }
      return ` placeholder="${escapeAttr(value)}"`;
    }
  );

  // 3. data-i18n-XXX="key" (cualquier sufijo distinto de "placeholder" y no empezando por "attr-")
  //    →  data-i18n-XXX="VALOR resuelto"  (el atributo se conserva, lo lee el JS del runtime)
  html = html.replace(
    /\sdata-i18n-([a-z][a-z0-9-]*)="([^"]+)"/g,
    (match, kind, key) => {
      if (kind === 'placeholder') return match;
      if (kind.startsWith('attr-')) return match;
      const value = t[key];
      if (value === undefined) {
        console.warn(`[build] missing translation key "${key}" for lang "${lang}"`);
        return match;
      }
      return ` data-i18n-${kind}="${escapeAttr(value)}"`;
    }
  );

  // 4. Atributos auxiliares del nav-toggle (los gestiona el JS para alternar aria-label).
  //    Resolver claves a su texto literal para que el JS pueda leerlas del DOM.
  html = html.replace(
    /\sdata-i18n-attr-aria-label-(open|close)="([^"]+)"/g,
    (match, kind, key) => {
      const value = t[key];
      if (value === undefined) return match;
      return ` data-aria-label-${kind}="${escapeAttr(value)}"`;
    }
  );

  return html;
}

function escapeAttr(s) {
  // Translations ya viene con &amp; / &lt;. Solo escapamos comillas para evitar romper atributos.
  return String(s).replace(/"/g, '&quot;');
}

function escapeJson(s) {
  // Para insertar dentro de un literal JSON-LD (entre comillas dobles).
  return String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writePage(lang, page) {
  let html = page.template;
  html = applyStructuralReplacements(html, lang, page);
  html = applyI18nReplacements(html, lang);

  const outFull = path.join(DIST, LOCALES[lang].path, page.outFile);
  ensureDir(path.dirname(outFull));
  fs.writeFileSync(outFull, html, 'utf8');
  console.log(`[build] wrote ${path.relative(ROOT, outFull)}  (${html.length} bytes)`);
}

/* ------------------------------------------------------------------
   Helpers — blog
   ------------------------------------------------------------------ */

// URL absoluta de una entrada (o del index) en un idioma dado.
// postId = null → index del blog. postId = string → entrada concreta.
function blogUrl(lang, postId) {
  if (postId === null) return BLOG_PATH[lang];
  const post = BLOG_POSTS.find(p => p.id === postId);
  if (!post) throw new Error(`[build] unknown blog post id "${postId}"`);
  return BLOG_PATH[lang] + post.slugs[lang] + '.html';
}

// Toggle ES/FR/EN para una entrada del blog: cada botón apunta a la entrada equivalente en su idioma.
function buildBlogLangToggle(activeLang, postId) {
  return LANG_ORDER.map(l => {
    const isActive = l === activeLang;
    const cls = 'lang-btn' + (isActive ? ' active' : '');
    const aria = isActive ? ' aria-current="page"' : '';
    return `<a href="${blogUrl(l, postId)}" class="${cls}" hreflang="${l}"${aria}>${LANG_LABEL[l]}</a>`;
  }).join('\n          ');
}

// Bloque <link rel="alternate" hreflang> + x-default para una entrada del blog.
function buildBlogHreflangBlock(postId) {
  const lines = LANG_ORDER.map(l =>
    `<link rel="alternate" hreflang="${l}" href="${SITE_URL}${blogUrl(l, postId)}" />`
  );
  lines.push(`<link rel="alternate" hreflang="x-default" href="${SITE_URL}${blogUrl('es', postId)}" />`);
  return lines.join('\n  ');
}

// Procesa un archivo HTML del blog: aplica marcadores estructurales propios del blog + comunes.
// postId puede ser null (index) o el id del post.
function applyBlogReplacements(html, lang, postId) {
  const loc = LOCALES[lang];
  const canonical = SITE_URL + blogUrl(lang, postId);

  const replacements = {
    '{{LANG}}': lang,
    '{{CANONICAL_URL}}': canonical,
    '{{HREFLANG_BLOCK}}': buildBlogHreflangBlock(postId),
    '{{OG_LOCALE}}': loc.ogLocale,
    '{{OG_LOCALE_ALTERNATES}}': buildOgAlternates(loc.alternates),
    '{{HOME_URL}}': LANG_PATH[lang],
    '{{AUDITORIA_URL}}': AUDITORIA_PATH[lang],
    '{{BLOG_URL}}': BLOG_PATH[lang],
    '{{LANG_TOGGLE}}': buildBlogLangToggle(lang, postId),
    '{{LEGAL_LINKS}}': buildLegalLinks(lang),
  };

  for (const [marker, value] of Object.entries(replacements)) {
    html = html.split(marker).join(value);
  }

  return html;
}

function writeBlogFile(lang, srcAbs, outRel, postId) {
  let html = fs.readFileSync(srcAbs, 'utf8');
  html = applyBlogReplacements(html, lang, postId);

  const outFull = path.join(DIST, LOCALES[lang].path, 'blog', outRel);
  ensureDir(path.dirname(outFull));
  fs.writeFileSync(outFull, html, 'utf8');
  console.log(`[build] wrote ${path.relative(ROOT, outFull)}  (${html.length} bytes)`);
}

function buildBlog() {
  for (const lang of LANG_ORDER) {
    const srcDir = path.join(SRC, 'blog', lang);
    if (!fs.existsSync(srcDir)) {
      console.log(`[build] blog: skipping ${lang} (no src/blog/${lang}/ — pendiente traducir)`);
      continue;
    }

    // Index del blog (mismo nombre en los 3 idiomas).
    const idxSrc = path.join(srcDir, 'index.html');
    if (fs.existsSync(idxSrc)) {
      writeBlogFile(lang, idxSrc, 'index.html', null);
    } else {
      console.warn(`[build] blog: ${lang}/index.html missing`);
    }

    // Entradas: cada una en su slug específico de idioma.
    for (const post of BLOG_POSTS) {
      const slug = post.slugs[lang];
      const srcAbs = path.join(srcDir, `${slug}.html`);
      if (!fs.existsSync(srcAbs)) {
        console.log(`[build] blog: skipping ${lang}/${slug}.html (no existe — pendiente traducir)`);
        continue;
      }
      writeBlogFile(lang, srcAbs, `${slug}.html`, post.id);
    }
  }
}

/* ------------------------------------------------------------------
   Static assets
   ------------------------------------------------------------------ */

function copyStaticAssets() {
  // Directorios completos (recursivo). 'blog' y 'subvenciones' eliminados — ahora se procesan
  // como páginas del build (src/blog/ y src/subvenciones.html).
  // Las páginas legales (privacidad/terminos/cookies/aviso-legal) las gestiona copyLegalPages()
  // para enrutar la versión FR a /fr/<slug>/.
  const dirs = ['css', 'js', 'assets'];
  for (const d of dirs) {
    const src = path.join(ROOT, d);
    if (!fs.existsSync(src)) continue;
    const dest = path.join(DIST, d);
    fs.cpSync(src, dest, { recursive: true });
    console.log(`[build] copied dir  ${d}/`);
  }

  // Archivos sueltos en la raíz.
  const files = ['favicon.ico', 'favicon.png', 'favicon.svg', 'sitemap.xml', 'robots.txt'];
  for (const f of files) {
    const src = path.join(ROOT, f);
    if (!fs.existsSync(src)) continue;
    fs.copyFileSync(src, path.join(DIST, f));
    console.log(`[build] copied file ${f}`);
  }
}

// Páginas legales estáticas. Fuente por idioma: ES = <slug>/index.html,
// FR = <slug>/index.fr.html, EN = <slug>/index.en.html.
// Destino: ES → dist/<slug>/index.html · FR → dist/fr/<slug>/index.html · EN → dist/en/<slug>/index.html.
function copyLegalPages() {
  for (const slug of LEGAL_SLUGS) {
    for (const lang of LANG_ORDER) {
      const srcName = lang === 'es' ? 'index.html' : `index.${lang}.html`;
      const src = path.join(ROOT, slug, srcName);
      if (!fs.existsSync(src)) {
        console.warn(`[build] legal: missing ${slug}/${srcName} (${lang.toUpperCase()})`);
        continue;
      }
      const dest = path.join(DIST, LOCALES[lang].path, slug, 'index.html');
      ensureDir(path.dirname(dest));
      fs.copyFileSync(src, dest);
      console.log(`[build] legal ${lang.toUpperCase()}  ${path.relative(ROOT, dest)}`);
    }
  }
}

function clean() {
  if (fs.existsSync(DIST)) {
    fs.rmSync(DIST, { recursive: true, force: true });
  }
  ensureDir(DIST);
}

/* ------------------------------------------------------------------
   Main
   ------------------------------------------------------------------ */

function main() {
  const t0 = Date.now();
  console.log('[build] start');
  clean();
  copyStaticAssets();
  copyLegalPages();
  for (const lang of LANG_ORDER) {
    for (const page of PAGES) writePage(lang, page);
  }
  buildBlog();
  console.log(`[build] done in ${Date.now() - t0}ms`);
}

main();
