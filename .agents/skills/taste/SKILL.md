---
name: taste
description: Criterio visual senior para OptiTurno: contraste óptimo, refinamiento de bordes, sombras sutiles y tipografía balanceada. Use when editando o revisando el diseño de cualquier vista de la PWA o el panel admin, o cuando necesites criterio estético para decidir una tarea de styling.
---

# Taste Skill — Criterio visual senior

Guía estética para el frontend de OptiTurno. Todo lo que se construya debe pasar el filtro de "buen gusto": **lo menos posible, pero pulido**. Las decisiones de estilo se toman SIEMPRE contra los tokens de `design.md`; este skill dicta el criterio, no la paleta.

## Contraste óptimo

- El texto principal se apoya en tinta (`--text-primary`), no en color. El color acentúa, el peso y la escala jerarquizan.
- Contraste de lectura: texto ≥ AA (4.5:1), texto principal en **AAA** (ver §7 de `design.md`). Nunca usar `slate-500` (`#64748B`) para texto pequeño o cifras, ni gris sobre gris para texto secundario en dark.
- "Color hablando solo" está prohibido: cada significado además lleva palabra (badges) o en su defecto forma (selección de chips = borde + relleno + texto).
- Texto/gradientes decorativos que reduzcan el contraste del contenido → se eliminan.

## Refinamiento de bordes

- Radios por tipo de elemento, siempre de la tabla de `design.md` §4 (`rounded-xl` input/botón/chip, `rounded-2xl` tarjeta/modal, `rounded-full` píldora). Nunca radios "sorpresa".
- Un borde `border-border-subtle` de 1px es el estado por defecto de las superficies; el hover agrega relleno suave (tint) en vez de aclarar el borde.
- Nunca dos líneas de contorno simultáneas (p. ej. borde + outline juntos). Foco = anillo `focus-visible` con `var(--primary)`.
- Separadores internos: `border-t` suave tipo `border-slate-100 dark:border-slate-800/80` (ver card de turnos §5.2). Nunca bordes izquierdos de color para jerarquía.

## Sombras sutiles

- Sombra = profundidad, no decoración. Escala existing de `design.md` §4: `shadow-sm` (tarjetas), `shadow-lg shadow-indigo-600/20` (solo primarios en hover/menús), `shadow-2xl` (modales/drawers).
- Sombras duras por defecto de Tailwind o `shadow-md` genéricas sin propósito → se quitan.
- En dark mode las tarjetas se distinguen por superficie (`--bg-surface`) más borde, no por sombra.

## Tipografía balanceada

- Fraunces SOLO para títulos de pantalla y wordmark; Manrope para toda la UI; JetBrains Mono para precios/horas (data). Ver §3 de `design.md`.
- Jerarquía por escala y peso, no solo por color. Un título no necesita `font-extrabold`: la serif ya carga el peso.
- `label-overline` (`text-[9px] uppercase tracking-[0.18em]`) solo para etiquetas/segmentos de sección, no para cuerpo.
- Evitar el doble énfasis pesado (bold + uppercase + color + tracking juntos) fuera de botones de 11px.
- Longitud de línea confortable en la PWA: contenido `max-w-3xl`, nunca líneas de ancho completo en escritorio.

## Señales de "AI slop" a evitar

- Demasiados gradientes (solo el hero de marca usa `from-indigo-600 to-purple-600`).
- Sombras negras duras, radios de 24px por todos lados, glow excesivo, texturas, animaciones infinitas salvo spinners.
- "Todo énfasis": si muchas cosas se destacan, nada se destaca. Exactamente UN acento de marca por pantalla (indigo) y UN verde sólido (disponible/confirmado).

## Procedimiento

1. Lee `design.md` completo (paleta, tipografía, layout/movimiento, componentes).
2. Antes de escribir, declara el "statement" de la vista: qué es lo principal, qué es lo secundario, cuál es la acción única.
3. Construye con tokens y patrones existentes; no inventes una paleta paralela.
4. En la revisión final, aplica el checklist de mal gusto de esta sección y el checklist de consistencia §10 de `design.md`.