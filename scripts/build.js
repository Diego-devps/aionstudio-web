#!/usr/bin/env node
// scripts/build.js — generador estático multilingüe (Camino B, W12+W11+W26+W7)
// Lee src/index.html + src/translations.js → produce dist/{,fr/,en/}/index.html
// Cero deps externas: solo módulos nativos de Node (fs, path).

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

const TEMPLATE_HOME = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8');
const TEMPLATE_AUDITORIA = fs.readFileSync(path.join(SRC, 'auditoria.html'), 'utf8');
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

// Páginas a generar: clave de archivo → { template, outRelPath bajo dist/[lang/], metaTitleKey opcional para SEO específico }
const PAGES = [
  { name: 'home',      template: TEMPLATE_HOME,      outFile: 'index.html',            seoPrefix: '' },
  { name: 'auditoria', template: TEMPLATE_AUDITORIA, outFile: 'auditoria/index.html',  seoPrefix: 'aud_' },
];

/* ------------------------------------------------------------------
   Helpers
   ------------------------------------------------------------------ */

// Construye el toggle ES/FR/EN. Si pageName === 'auditoria', el toggle apunta a /[lang/]auditoria/.
function buildLangToggle(activeLang, pageName) {
  const pathMap = pageName === 'auditoria' ? AUDITORIA_PATH : LANG_PATH;
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
    '{{LANG_TOGGLE}}': buildLangToggle(lang, page.name),
    '{{NAV_MENU_OPEN}}': escapeAttr(t.nav_menu_open),
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

function copyStaticAssets() {
  // Directorios completos (recursivo).
  const dirs = ['css', 'js', 'assets', 'blog', 'cookies', 'privacidad', 'subvenciones', 'terminos'];
  for (const d of dirs) {
    const src = path.join(ROOT, d);
    if (!fs.existsSync(src)) continue;
    const dest = path.join(DIST, d);
    fs.cpSync(src, dest, { recursive: true });
    console.log(`[build] copied dir  ${d}/`);
  }

  // Archivos sueltos en la raíz.
  const files = ['favicon.png', 'favicon.svg', 'sitemap.xml', 'robots.txt'];
  for (const f of files) {
    const src = path.join(ROOT, f);
    if (!fs.existsSync(src)) continue;
    fs.copyFileSync(src, path.join(DIST, f));
    console.log(`[build] copied file ${f}`);
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
  for (const lang of LANG_ORDER) {
    for (const page of PAGES) writePage(lang, page);
  }
  console.log(`[build] done in ${Date.now() - t0}ms`);
}

main();
