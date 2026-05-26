# Protocolo para añadir entradas al blog

**Vigente desde:** 26/05/2026 (sesión 7.4a.bis cierre)
**Audiencia:** Diego + cualquier instancia de Claude que asista a redactar entradas

---

## Modelo de trabajo

Diego pasa la entrada **en español**. Claude:

1. Revisa y edita el ES si Diego lo pide explícitamente.
2. Traduce **nativa** (no literal) a FR con adaptación cultural por mercado.
3. Traduce **nativa** a EN con terminología internacional.
4. Genera las 3 URLs físicas en `src/blog/es/`, `src/blog/fr/`, `src/blog/en/`.
5. Actualiza `scripts/build.js` (`BLOG_POSTS`) con el nuevo id + slugs ES/FR/EN.
6. Actualiza los 3 `index.html` del blog (ES/FR/EN) añadiendo card del nuevo post.
7. Actualiza `sitemap.xml` con las 3 URLs nuevas + hreflang cruzado.
8. Build local + verificación.
9. Commit + push + PR (Diego revisa antes de mergear).

---

## Paso 1 — Definir slugs

Antes de escribir, fijar los 3 slugs (sin `.html`, sin paths). Cada uno debe ser **nativo del idioma**, sin palabras del ES en FR o EN.

Convenciones:
- **ES**: kebab-case, sin acentos donde el SEO no penalice (`ia-para-clinicas-dentales`).
- **FR**: kebab-case, sin acentos (`ia-pour-cabinets-comptables`, no `ia-pour-cabinets-compt-ables` ni con é).
- **EN**: kebab-case, terminología internacional (`ai-for-accounting-firms`, no `accounting-companies` ni anglicismos forzados).

Si dudas, pregunta a Diego antes de empezar a escribir.

---

## Paso 2 — Crear los 3 archivos fuente

```
src/blog/es/[slug-es].html
src/blog/fr/[slug-fr].html
src/blog/en/[slug-en].html
```

**Cada archivo es monolingüe.** No incluir bloques `data-lang-content` ni script toggle JS al final.

**Marcadores que el build sustituye** (úsalos verbatim — el build hace `String.split().join()`):

| Marcador | Resuelto a |
|---|---|
| `{{LANG}}` | `es`, `fr`, `en` (atributo `<html lang>`) |
| `{{CANONICAL_URL}}` | URL absoluta de esta entrada en este idioma |
| `{{HREFLANG_BLOCK}}` | 3 `<link rel="alternate" hreflang>` + x-default cruzados a las versiones equivalentes |
| `{{OG_LOCALE}}` | `es_ES`, `fr_FR`, `en_GB` |
| `{{OG_LOCALE_ALTERNATES}}` | 2 `<meta property="og:locale:alternate">` con los otros idiomas |
| `{{HOME_URL}}` | `/`, `/fr/`, `/en/` (raíz del idioma actual) |
| `{{AUDITORIA_URL}}` | `/auditoria/`, `/fr/auditoria/`, `/en/auditoria/` |
| `{{BLOG_URL}}` | `/blog/`, `/fr/blog/`, `/en/blog/` |
| `{{LANG_TOGGLE}}` | 3 `<a>` con `lang-btn`/`active`/`aria-current`, cada uno apuntando a la entrada equivalente en su idioma |

**Plantilla de partida**: copia `src/blog/es/recepcionista-3am.html` o `src/blog/fr/receptionniste-3h-du-matin.html` y reemplaza el cuerpo del `<main class="article-content">` + el sidebar TOC + título + meta description + JSON-LD headline + categoría + fecha + tiempo de lectura.

**Rutas absolutas**, no relativas: `/css/styles.css`, `/js/main.js`, `/assets/img/founder.jpeg`, `/privacidad/`, etc. El build genera output en distintas profundidades (`/blog/`, `/fr/blog/`, `/en/blog/`) y los `../` se rompen.

---

## Paso 3 — Registrar el post en `scripts/build.js`

Añadir una entrada nueva al array `BLOG_POSTS`:

```js
const BLOG_POSTS = [
  // ... entradas existentes ...
  {
    id: 'mi-tema',                       // id estable, kebab-case, único
    slugs: {
      es: 'mi-tema-en-espanol',          // sin .html
      fr: 'mon-sujet-en-francais',
      en: 'my-topic-in-english',
    },
  },
];
```

Sin esta línea, el build skipea los 3 archivos con un mensaje "no existe".

---

## Paso 4 — Actualizar los 3 `index.html` del blog

Añadir una card al `.blog-grid` de cada index:

- `src/blog/es/index.html` con título + descripción + slug ES
- `src/blog/fr/index.html` con título + descripción + slug FR
- `src/blog/en/index.html` con título + descripción + slug EN

Convención de orden: cronológico inverso (más reciente arriba). Si quieres mantener el orden de publicación del post nuevo según su fecha, insertar en la posición correcta.

---

## Paso 5 — Actualizar `sitemap.xml`

Añadir 3 bloques `<url>` (uno por idioma) al final, antes de `</urlset>`. Cada bloque incluye:

- `<loc>` URL absoluta
- `<lastmod>` fecha YYYY-MM-DD del push
- `<priority>0.7</priority>` (estándar para post; el index del blog es 0.8)
- `<xhtml:link rel="alternate" hreflang>` × 3 + x-default

Copiar la estructura de cualquier post existente como plantilla.

---

## Paso 6 — Build local + verificación

```bash
npm run build
```

Verificar:
- ✓ No hay marcadores `{{...}}` sin resolver en `dist/`.
- ✓ Los 3 archivos del post nuevo aparecen en `dist/blog/`, `dist/fr/blog/`, `dist/en/blog/`.
- ✓ `<html lang>` correcto en cada uno.
- ✓ `canonical` apunta a la URL del idioma actual.
- ✓ `hreflang` cruzado correcto entre las 3 versiones.
- ✓ El selector de idioma del nav apunta a las entradas equivalentes (no a la home del idioma).
- ✓ El index del blog en los 3 idiomas muestra la nueva card.
- ✓ `sitemap.xml` incluye las 3 URLs nuevas.

```bash
npm run dev    # build + sirve en localhost:3000
```

Visita `/blog/[slug]` en los 3 idiomas. Pulsa el selector de idioma desde una entrada concreta → debe llevar a la entrada equivalente, no a `/fr/` ni a `/fr/blog/`.

---

## Paso 7 — Commit + push + PR

```bash
git add src/blog/es/[slug-es].html src/blog/fr/[slug-fr].html src/blog/en/[slug-en].html \
        scripts/build.js sitemap.xml
git commit -m "blog: añade entrada \"[título corto]\" en ES/FR/EN"
git push -u origin [branch-name]
```

Diego revisa el PR y mergea cuando esté conforme con el copy.

---

## Reglas de copy

### Traducción nativa, no literal

- **FR**: vouvoiement consistente (`vous`), no tutoyer. Sin anglicismos forzados.
- **EN**: terminología internacional. Evitar UK-specific o US-specific salvo intencional. Mantener tono directo de Aion (no marketing fluff).
- **Adaptación por mercado**:
  - "gestoría" (ES) → "cabinet comptable" / "fiduciaire" (FR) → "accounting firm" / "accounting practice" (EN)
  - "clínica dental" (ES) → "cabinet dentaire" (FR, Mónica usa "cabinet") → "dental clinic" (EN)
  - "modelo 303" (ES, IVA trimestral) → "TVA" (FR genérico, no nombres de formularios locales) → "VAT" (EN)

### Wording de marca interna

**Mantener** marcas internas como "AionVoice", "AionFlow", "AionInbox" cuando aparezcan **dentro del cuerpo narrativo** del blog (decisión 7.4a.bis). Refuerza familiaridad en contenido educativo profundo.

W14 (sustitución por títulos públicos como "Agentes de Voz IA") **sólo aplica a las cards de servicios de la home**, no al blog narrativo.

Si el artículo trata de un servicio entero como pieza promocional (no como ejemplo dentro de un argumento más amplio), considerar si la presentación al lector sería más limpia con el titular público. Preguntar a Diego en caso de duda.

### Verticales sensibles

Para entradas que tocan sector salud (cabinet dentaire / dental clinic):
- **No** detallar normativa local (HDS en FR, HIPAA en EN, RGPD ES) en cuerpo del artículo.
- **Sí** mencionar de forma implícita que la solución minimiza datos tratados (alcance limitado: agenda + información general, sin historiales médicos). Refuerza confianza sin entrar en compromisos legales.

Para entradas que tocan sector financiero/legal:
- Cita estimaciones de tiempo o impacto con rango ("entre 15 y 25 horas"), no cifras exactas que parezcan promesas.
- "ROI estimado" no es "ROI garantizado".

---

## Si algo falla

- **Build skipea un archivo**: comprueba que el slug del archivo coincide con el slug declarado en `BLOG_POSTS` para ese idioma.
- **Marcador `{{...}}` sin resolver en `dist/`**: el marcador no existe en el build o está mal escrito. Lista completa en la tabla de Paso 2.
- **Hreflang apunta al sitio mal**: el mapping en `BLOG_POSTS` está mal — revísalo.
- **`<html lang>` siempre dice "es"**: el archivo no tiene `{{LANG}}` en el `<html>` — usaste `<html lang="es">` literal.
- **El nav lleva a la home del idioma en lugar de a la entrada equivalente**: usaste el bloque legacy de `<a href="/" class="lang-btn active">...` en lugar de `{{LANG_TOGGLE}}`.
