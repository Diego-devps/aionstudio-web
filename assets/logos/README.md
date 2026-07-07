# Marca Aion Studio — set de logos (día 24)

La **A de Aion Studio** (monoline de la marca) con el **palo diagonal izquierdo duplicado**
como eco separado (efecto "doble"). Mismo dibujo en todas; cambian color y fondo para poder
usar el logo según la página sea **clara** u **oscura**, **con** o **sin** caja.

`viewBox 0 0 64 64` · trazo 4 · caps/joins redondos. Escalables a cualquier tamaño.

## Cuál usar

| Archivo | Qué es | Dónde |
|---|---|---|
| `logo-mark-tint.svg`  | Sin caja · trazo **navy** (#1A2A6C) | Marca sobre fondo **claro/papel** (barra superior de la app, web) |
| `logo-mark-ink.svg`   | Sin caja · trazo **tinta** (#0A0A0A) | Alternativa monocroma sobre fondo **claro** |
| `logo-mark-paper.svg` | Sin caja · trazo **papel** (#F2EDE3) | Marca sobre fondo **oscuro/tinta** |
| `logo-badge-tint.svg` | Con caja **navy** + A blanca | **Favicon** y badge principal (fondo propio, va en cualquier sitio) |
| `logo-badge-ink.svg`  | Con caja **tinta** + A papel | Badge monocromo para contextos **oscuros** |
| `logo-badge-paper.svg`| Con caja **papel** + A tinta | Badge claro para contextos **claros** |

En la app, el componente `src/components/Logo.tsx` hace lo mismo por código: `variant="mark"`
(sin caja, toma el color del texto vía `currentColor` → se le da con `text-tint`/`text-foreground`)
y `variant="badge"` (caja navy + A blanca). Estos SVG sueltos son para todo lo demás (web, docs,
firmas, material impreso).

> El favicon de la app (`public/favicon.svg`) es el mismo dibujo que `logo-badge-tint.svg`.
> Pendiente de propagar al repo `aionstudio-web` para que web y CRM compartan marca.
