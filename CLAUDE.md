# CLAUDE.md — Aion Studio Web

## Proyecto
Web corporativa de Aion Studio. HTML + CSS + JS vanilla. Sin frameworks. Deploy en Vercel.

## Reglas de seguridad
- READ-ONLY por defecto: no borres ningún archivo sin confirmación explícita
- No instales dependencias npm sin explicar qué hacen y pedir confirmación
- No accedas ni modifiques archivos .env, .ssh, ni credenciales
- Siempre haz commit antes de cambios grandes
- No hagas push automático sin confirmación

## Stack
- HTML5 semántico
- CSS3 con variables custom (no frameworks)
- JS vanilla (no jQuery, no React)
- Fuente: Inter (Google Fonts)
- Deploy: Vercel (rama main)

## Estructura de archivos
```
aionstudio-web/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── main.js
├── assets/
│   └── img/
└── CLAUDE.md
```

## Paleta de colores
- Fondo principal: #0a0a14
- Fondo secundario: #0f0f1e
- Cyan principal: #00d4ff
- Cyan hover: #00b8d9
- Texto principal: #ffffff
- Texto secundario: #8892a4

## Secciones (orden)
1. Nav — logo + links + selector ES/FR/EN + CTA "Auditoría Gratuita"
2. Hero — headline + subtítulo + 2 CTAs + fondo con malla geométrica cyan
3. Métricas — +50 clientes / 12x ROI / 0.1s respuesta
4. Servicios — grid 2x2: AionVoice, AionFlow, AionInbox, Web IA
5. Misión y Visión — texto + foto fundador
6. Formulario — "Agenda tu Auditoría"
7. Footer — nav + legal + ubicación + redes

## Idiomas
Traducción estática con objeto JS. Botones ES / FR / EN en la nav.
Sin APIs externas, sin i18n libraries.

## Animaciones
- Cards de servicios: borde cyan brillante al hover
- Métricas: contador animado al entrar en viewport
- Nav: sticky con blur al hacer scroll
- Hero: malla geométrica animada (canvas o CSS)