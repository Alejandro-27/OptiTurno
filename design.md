# Design System — OptiTurno

Sistema de diseño oficial de la PWA de OptiTurno. Define la identidad visual, el lenguaje de componentes y los patrones de UX que deben usarse en **todos** los flujos de la app (cliente, comercio, empleado y superadmin).

> Convenciones: `cliente` = PWA (Reservar Cita / Mis Turnos / Mi Perfil). `comercio` = panel admin. `empleado` = panel restringido. `superadmin` = panel + gestión de usuarios.

---

## 1. Concepto y dirección

**"Electric Indigo & Slate"** — una paleta profesional y clara para un SaaS de confianza, con un acento eléctrico para la acción y neutros gris-pizarra que dejan respirar los datos.

- El **indigo eléctrico** es la marca: el color de todas las acciones primarias, activos de navegación y enlaces.
- Los neutros son **slate** (gris-pizarra frío): fondos `#F8FAFC`, superficies blancas, bordes `#E2E8F0`, texto `#0F172A`/`#64748B` en claro.
- En dark mode la paleta se aclara: indigo `#6366F1`/`#818CF8` sobre superficies `#111827` y fondo `#090D16`.
- Las acciones y los datos importantes respetan semántica de color (éxito = verde, peligro = rojo, advertencia = ámbar).

**Principios:**

1. **Claro, preciso, táctil.** Superficies nítidas, bordes suaves (12–16 px), sombras difusas. Contraste de lectura AAA en texto principal.
2. **Jerarquía tipográfica evidente.** Display serif para títulos de pantalla, sans geométrica para UI, mono para precios/horas.
3. **Mobile-first.** Cada pantalla se diseña primero para pulgar (≥ 44 px de objetivo táctil) y se expande a escritorio.
4. **A11y por defecto.** Contraste AA+ en texto, foco visible en teclado, etiquetas y atributos ARIA en modales/acciones.
5. **Una acción, un color.** El indigo es de la marca; el verde sólido solo significa *disponible/confirmado*; el rojo solo *destructivo/peligro*; el ámbar solo *pendiente*.

---

## 2. Paleta de colores

Tokens definidos en `frontend/src/index.css` (bloque `@theme`). La paleta se declara como variables CSS semánticas en `:root` (claro) y `.dark` (oscuro), y se mapea a utilidades Tailwind vía `@theme` (`--color-*`). Las rampas `indigo`, `slate` y `purple` usan los valores por defecto de Tailwind; en dark se alinean a los hex del spec:

| Escala | Uso | Reemplaza a |
|---|---|---|
| `slate` | Neutros (fondos, bordes, texto secundario) | grises cálidos legacy |
| `indigo` | **Marca / acción** — CTAs, activos, links | granate legacy |
| `purple` | Violeta para gradientes de marca (`to-purple-600`) | uva legacy |
| `emerald`, `amber`, `red`, `rose` | Semánticos (éxito, pendiente, peligro) | iguales |

### Tokens semánticos (variables CSS)

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--bg-app` | `#F8FAFC` | `#090D16` | Fondo de página (`bg-app`) |
| `--bg-surface` | `#FFFFFF` | `#111827` | Superficies / tarjetas (`bg-surface`) |
| `--border-subtle` | `#E2E8F0` | `#1F2937` | Bordes (`border-border-subtle`) |
| `--primary` | `#4F46E5` | `#6366F1` | Acción primaria (`bg-primary`) |
| `--primary-hover` | `#4338CA` | `#818CF8` | Hover primario (`bg-primary-hover`) |
| `--text-primary` | `#0F172A` | `#F9FAFB` | Texto principal (`text-text-primary`) |
| `--text-muted` | `#64748B` | `#9CA3AF` | Texto secundario (`text-text-muted`) |
| `--badge-success-bg` | `#ECFDF5` | `#064E3B` | Badge éxito: fondo |
| `--badge-success-text` | `#047857` | `#34D399` | Badge éxito: texto |

Los tokens generan utilidades por nombre (`bg-primary`, `border-border-subtle`, `text-text-muted`, `bg-surface`, `bg-success-bg`…) y se resuelven automáticamente según el tema — no hace falta escribir variantes `dark:` para ellos.

### Neutros — Slate (`slate`)

Rampa por defecto de Tailwind (mín. hasta `slate-500` para texto legible). En dark se alinea con el spec: `slate-50=#F9FAFB`, `slate-400=#9CA3AF`, `slate-800=#1F2937`, `slate-900=#111827`, `slate-950=#090D16`.

| Token | Claro | Uso |
|---|---|---|
| `slate-50` | `#F8FAFC` | Fondo de página (claro = `--bg-app`) |
| `slate-200` | `#E2E8F0` | Bordes suaves (= `--border-subtle`) |
| `slate-500` | `#64748B` | Texto secundario (= `--text-muted`) |
| `slate-900` | `#0F172A` | Texto principal (= `--text-primary`) |
| `slate-950` | `#020617` | Fondo muy oscuro (dark usa `#090D16`) |

### Marca — Electric Indigo (`indigo`)

Ánclas: `indigo-600 #4F46E5` (primario), `indigo-700 #4338CA` (hover), `indigo-400 #818CF8` / `indigo-500 #6366F1` (acentos sobre fondo oscuro). En dark, `indigo-600` → `#6366F1` y `indigo-700` → `#818CF8` para mantener brillo sobre superficies oscuras.

| Token | Hex (claro) | Uso |
|---|---|---|
| `indigo-400` | `#818CF8` | Texto/icono acento en dark |
| `indigo-500` | `#6366F1` | Hover de texto de marca |
| **`indigo-600`** | `#4F46E5` | **CTA primario, texto de marca, foco (AAA sobre blanco: 7.0:1)** |
| `indigo-700` | `#4338CA` | Hover de CTA (AAA sobre blanco: 8.6:1) |
| `indigo-800` | `#3730A3` | Presionado / activo |
| `purple-500` | `#A855F7` | Gradiente superior |
| `purple-600` | `#9333EA` | Gradiente inferior (`from-indigo-600 to-purple-600`) |

Reglas:
- El CTA primario **siempre** `bg-primary hover:bg-primary-hover` (o `btn-primary`) con texto blanco. Nunca invertir.
- Texto de marca legible: mínimo `text-indigo-500` (AA sobre `#FFFFFF`); usar `indigo-600/700` para énfasis.
- Gradientes de marca solo para *marcas visuales* (badge del logo, hero), siempre `from-indigo-600 to-purple-600`.

### Semánticos (siguen la escala de Tailwind)

| Estado | Token base |
|---|---|
| Éxito / disponible / confirmado | `emerald` |
| Pendiente / pago pendiente | `amber` |
| Peligro / cancelar / eliminación | `red` (y `rose` en admin) |

Regla de estados: un slot disponible puede ser `emerald-500/20` pero el **seleccionado** pasa a sólido `bg-emerald-600 text-white`; nunca marcar dos significados con la misma forma (color + texto + ícono).

---

## 3. Tipografía y jerarquía

Familias (Google Fonts, importadas en `index.css`):

| Uso | Familia | Token |
|---|---|---|
| Display / títulos de pantalla | **Fraunces** (400–700, opsz) | `font-display` |
| UI / cuerpo / botones | **Manrope** (400–800) | `font-sans` (default) |
| Valores numéricos (precios, horas) | **JetBrains Mono** | `font-mono` |

### Escala

| Rol | Clase | Observable |
|---|---|---|
| H1 de pantalla | `font-display text-2xl md:text-3xl font-semibold` | Título de sección/pantalla |
| H2 | `font-display text-lg md:text-xl font-semibold` | Subtítulos de bloque |
| Nombre de servicio/turno | `text-sm font-bold text-slate-900 dark:text-slate-50` | — |
| Overline (etiqueta de campo / sección) | `label-overline` (`text-[9px] font-bold uppercase tracking-[0.18em]`) | Hoy minúsculas de 9–10 px |
| Cuerpo / meta | `text-xs` | — |
| Números | `font-mono font-semibold` | Precios `$… COP`, horas `14:30` |

Reglas:
- Fraunces **solo** para títulos y el wordmark "OptiTurno"; el resto de la UI es Manrope. Evitar cursivas decorativas innecesarias.
- Nunca usar `font-extrabold` para títulos display con Fraunces: su fuerza está en la serif, `font-semibold` es suficiente.
- Precios siempre en `font-mono` y con el símbolo del país (`COP` por defecto).
- Horas y rangos de tiempo en `font-mono` cuando aparecen como dato (no como botón).

---

## 4. Layout, geometría y movimiento

### Espaciado (8 px grid)

- Padding de tarjetas: 16 px (`p-4`) en móvil, 20–24 px (`p-5`/`p-6`) en escritorio.
- Escala de hue solo con valores de Tailwind: `1, 1.5, 2, 3, 3.5, 4, 5, 6, 8`.

### Radios

- Botones, inputs, chips: `rounded-xl` (12 px).
- Tarjetas, modales: `rounded-2xl` (16 px).
- Badges, píldoras: `rounded-full`.
- Logo/avatar: `rounded-xl` (cuadrado) o `rounded-full` (persona).

### Sombras

- Tarjetas: `shadow-sm`.
- Flotación (menú, CTA hover): `shadow-lg shadow-indigo-600/20` (sombra con tinte de marca solo en primarios).
- Modales/drawers: `shadow-2xl`.
- Evitar sombras por defecto de Tailwind sin tinte o excesivas; las superficies claras no necesitan sombras duras.

### Movimiento (clases `animate-*` de `index.css`)

- `animate-fade-in` — paneles, banners.
- `animate-scale-up` — modales, confirmaciones.
- `animate-slide-in` — drawers/sidebar móvil.
- `animate-slide-left` — cambios de paso del flujo de reserva.
- `active:scale-[0.98]` — microfeedback en botones.
- Transiciones de 150–200 ms (`transition-all duration-200`). Nada de rides 3D, bounce por defecto ni animaciones en loop salvo spinners.

No se agregan librerías de animación.

---

## 5. Componentes

Todas las clases de componente viven en `@layer components` de `index.css` para que las utilidades de Tailwind siempre las sobreescriban.

### 5.1 Botones

| Variante | Clase | Uso |
|---|---|---|
| Primario | `btn btn-primary` | Acción principal de cada pantalla (Agendar, Continuar, Guardar, Iniciar sesión) |
| Secundario | `btn btn-secondary` | Alternativa a la primaria (cancelar modal, volver) |
| Fantasma | `btn btn-ghost` | Acciones suaves (Agendar otro turno) |
| Destructivo | `btn btn-danger` | Solo cancelar/eliminar (confirmación) |
| Chips de rango | `chip` + estado | Slots de fecha/hora |

Tamaño estándar: `py-2 px-4 text-[11px] font-extrabold uppercase tracking-wider rounded-xl`. Objetivo táctil ≥ 40 px.

### 5.2 Cards de turnos (PWA y admin)

```
[icono de 40px con tint]  Nombre del servicio          [badge estado]
                          Profesional · Especialidad
fecha (emerald)  hora (mono, brand)                    $… COP (mono)
[divisor]  Acción de cancelación (ghost-danger)
```

- Contenedor: `card` (`bg-surface border border-border-subtle rounded-2xl shadow-sm`).
- Turnos cancelados: `opacity-60` + badge con `line-through`.
- El divise de la card es `border-t border-slate-100 dark:border-slate-800/80`; nunca usar borde izquierdo de color para jerarquía.

### 5.3 Badges de estado

| Estado | Clase | Legible |
|---|---|---|
| Pago pendiente | `badge badge-warning` | `Pago pendiente` |
| Confirmado | `badge badge-success` | `Confirmado` |
| Cancelado | `badge badge-danger` | `Cancelado` (+ `line-through`) |
| Completado | `badge badge-neutral` | `Completado` |

Siempre con color **+** texto + (opcional) ícono. El color nunca comunica solo.

### 5.4 Chips de fecha/hora

- Base: `chip` (borde emerald translúcido, texto emerald).
- Seleccionado: `chip chip-selected` (sólido `emerald-600`, blanco, `scale-105`).
- Ocupado: `chip chip-disabled` (tachado, sin pointer).
- Días de fecha: tiles `rounded-xl py-2 text-center`; seleccionado = `bg-indigo-600 text-white border-indigo-600 shadow`.

### 5.5 Inputs

- Clase base: `input` (borde `--border-subtle`, superficie `--bg-surface`, foco = borde + anillo `primary/15`, ícono flotante izquierdo con `pl-10`).
- Etiqueta: `label-overline` como `<label>` semántico.
- Errores: al lado/bajo del campo cuando sea posible; banners solo para errores de bloque (auth, carga).
- Campos deshabilitados (email readonly): `opacity-60 cursor-not-allowed`.

### 5.6 Modales

```
[scrim: bg-slate-950/60 backdrop-blur-sm]  →  [card 16px, rounded-2xl, shadow-2xl, max-w-sm]
```

- Rol: `role="dialog" aria-modal="true" aria-labelledby="<id>-title"`.
- Título en `font-display`, close `X` en la esquina.
- Acciones: destructiva a la derecha, secundaria a la izquierda.
- Botón de cierre deshabilitado mientras hay operación en curso (`loader` + texto "…").

### 5.7 Estados de la pantalla

- **Carga**: spinner `border-brand` + texto corto centrado.
- **Vacío**: ícono en círculo de tint + H3 + descripción + CTA si aplica.
- **Error de usuario**: banner `bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400` con ícono `AlertCircle` y mensaje **genérico** (ley: no exponer `err.message` interno).
- **Éxito (inline)**: banner `bg-emerald-500/10 border-emerald-500/30`.

---

## 6. Patrones de flujo

### 6.1 Autenticación (`AccessAuth`)

- Tarjeta única en centro (`max-w-md`, fondo `surface`). Tab switch **Iniciar Sesión / Crear Cuenta**.
- Registro: selector de tipo **Cliente | Comercio** (2 cards táctiles ≥ 44 px), luego nombre → teléfono (opcional) → email → contraseña (con toggle).
- El botón primario es `btn-primary` a ancho completo y comunica la acción exacta: `Iniciar Sesión` / `Crear Cuenta Cliente`.
- Error de credenciales: banner rojo genérico sobre el formulario; nunca mostrar detalle interno.
- `aria-invalid` y `aria-describedby` en errores de campo cuando aplique.

### 6.2 Catálogo y reserva (`ClientPwa`)

Flujo 4 pasos con **indicador de progreso** (3 segmentos + éxito):

```
Paso 1 Catálogo → Paso 2 Profesional → Paso 3 Fecha y hora → Confirmación
```

- **Paso 1**: hero de marca (gradiente indigo→violeta, reseñas en ámbar) + lista `ServiceCard` (badge categoría, nombre, duración `clock+min`, precio mono, botón `Agendar`).
- **Paso 2**: lista de profesionales seleccionable (avatar `rounded-full`, radio circular brand).
- **Paso 3**: rail de fechas horizontal scroll (14 días), grilla de horas (`chip`), bloque de "Horas ocupadas" colapsado, footer con **Total** + `Continuar`.
- **Confirmación**: check emerald, resumen de ticket en `card` (fracciones key/value), CTA secundarios (Google Calendar / WhatsApp), link ghost "Agendar Otro Turno".
- Cada paso: botón "volver" (flecha) arriba izquierda; el cambio de paso anima con `animate-slide-left`.

### 6.3 Mis Turnos (`MisTurnosView`)

- Lista vertical de `card` de turno (definida en 5.2), más reciente primero.
- Cancelar: botón ghost-rojo abre el **modal de confirmación**; en curso muestra spinner + "Cancelando…".
- Cancelado: card atenuada, sin acción de cancelación.
- Vacío: estado con `CalendarX2` + copy + CTA a Reservar.
- Automático: al entrar y tras cancelar se recarga; error de carga permite **Reintentar**.

### 6.4 Mi Perfil (`MiPerfilView`)

- Formulario en `card` `max-w-md`: Nombre (editable), WhatsApp (editable), Email (readonly).
- Guardar = `btn-primary` ancho completo con estado `Loader2`. Éxito: banner emerald inline que se desvanece (3.5 s).

---

## 7. Accesibilidad (WCAG 2.2)

1. **Contraste**: texto ≥ 4.5:1 (AA); texto principal **AAA** (`#0F172A` sobre `#FFFFFF` ≈ 19.8:1, primario `#4F46E5` sobre blanco = 7.0:1). El texto secundario usa `--text-muted` (AA). Los acentos en dark: `indigo-400 #818CF8` para mantener AA+ sobre `#111827`.
2. **Foco visible**: regla global `focus-visible` (anillo 2px `var(--primary)`, offset 2px) en `index.css`; no remover `outline` nunca.
3. **Objetivos táctiles**: botones/íconos accionables ≥ 40×40 px; elementos listados ≥ 44 px alto.
4. **Semántica**: `<label>` ligado a `htmlFor`, botones reales (`<button>`), `aria-label` en icon-botones (menú, toggle, cerrar).
5. **Modales**: `role="dialog"`, `aria-modal`, `aria-labelledby` apuntando al título; cerrar con `Escape` cuando se pueda.
6. **Movimiento**: nada que parpadee más de 3 veces/segundo (sin `animate-ping` en contenido esencial), respetar `prefers-reduced-motion` cuando haya animaciones largas.
7. **Color+Rótulos**: estados siempre con palabra + color (badges), nunca color solo.
8. **Orden de lectura / mobile-first**: DOM = contenido antes de menús flotantes.

---

## 8. Responsive (mobile-first)

| Breakpoint | Comportamiento |
|---|---|
| `< md (768px)` | Sidebar/drawer hamburguesa; `p-4`; barras están dentro del flujo; grillas de horas a 2 columnas; acciones a ancho completo cuando son primarias |
| `md (≥ 768px)` | Sidebar fijo 280 px; `p-6`; grillas 3 columnas |
| `lg (≥ 1024px)` | `p-8`; contenedor de contenido `max-w-3xl` centrado en la PWA |

- El contenido principal nunca excede `max-w-3xl` en la vista cliente.
- Scroll horizontal solo para el rail de fechas (con `custom-scrollbar`).
- Modales: `p-4` alrededor, `w-full max-w-sm`.

---

## 9. Implementación técnica

### Dónde viven los tokens

- `frontend/src/index.css`: variables `:root`/`.dark` (paleta literal) + `@theme` (mapeo a utilidades, fonts) + base (bg/text global, focus, selection) + `@layer components` (`.btn*`, `.card`, `.badge*`, `.chip*`, `.input`, `.label-overline`) + animaciones.
- Dark mode: clase `.dark` en `<html>` (`ThemeToggle`), variante `@custom-variant dark`.

### Cómo agregar un color nuevo

1. Añadir el token semántico en `:root` y `.dark` (`--foo`) y mapearlo en `@theme` (`--color-*`). Tailwind 4 genera utilidades automáticamente.
2. Documentarlo en la sección 2.
3. Nunca usar hex arbitrario en JSX; si la escala falta, primero crear el token.

### Migración completada (paleta "Electric Indigo & Slate")

- Granate `indigo-*` legacy (`#922C41`, `#7A2335`, `#531A26`, `#2E0D16`…) → valores default de Tailwind (marca `#4F46E5` / `#4338CA`), con overrides en `.dark` a `#6366F1`/`#818CF8`.
- Neutros cálidos (papel/tinta `#FCFAF5`, `#211C14`…) → rampa `slate` default; `.dark` alinea `slate-50/400/800/900/950` al spec.
- `copper-*` → eliminado: estrellas/acentos de valor ahora en `amber-400`, precios destacados en `primary`/`indigo-400`.
- Scrims `bg-ink/60` → `bg-slate-950/60`; `paper`/`ink`/`accent`/`brand-dark` → reemplazados por `surface`/`app`/`primary` (se conserva alias `--color-brand` → `primary`).
- Gradientes `from-indigo-600 to-purple-600` ya usan los tonos correctos en ambos temas.

### Guía para subagentes de IA

1. Lee `design.md` y `AGENTS.md` antes de tocar código.
2. Usa siempre tokens, nunca hex hardcodeados en JSX.
3. Reutiliza `.btn`, `.card`, `.badge-*`, `.chip*`, `.input`, `.label-overline`.
4. Mantén la semántica de color: indigo=acción/marca, emerald=éxito/disponible, rojo=destructivo, ámbar=pendiente.
5. No redefinir escalas que no estén en la sección 2; no inventar paletas paralelas.
6. Verifica `npx tsc --noEmit` en `frontend/` y `backend/` antes de entregar.

---

## 10. Checklist de consistencia

- [ ] Fondo de página = `bg-app` (`slate-50`/`slate-950`), nunca hex frío.
- [ ] CTA primario = `btn-primary` (indigo / `bg-primary`), texto blanco, shadow `indigo-600/25`.
- [ ] Un solo "verde sólido" por pantalla: solo disponible/confirmado/éxito.
- [ ] Etiquetas de sección con `label-overline`; precios/horas en `font-mono`.
- [ ] Títulos de pantalla en `font-display`.
- [ ] Badges de estado con palabra + color (tabla 5.3).
- [ ] Modales con `role="dialog"` y `aria-labelledby`.
- [ ] Botones/íconos ≥ 40 px de objetivo; `focus-visible` intacto.
- [ ] Mensajes de error genéricos (nunca `err.message` interno).