---
name: emil-kowalski-ui-rules
description: Reglas de UI de Emil Kowalski para OptiTurno: transiciones físicas naturales, microinteracciones <200ms, animaciones de presencia con springs y pulimento extremo en componentes interactivos. Use when diseñando o refactorizando interacciones, hovers, aperturas de modales/drawers, feedback visual o microanimaciones en la PWA.
---

# Emil Kowalski UI Rules — Pulimento extremo

La UI debe sentirse **física y rápida**: el sistema responde a cada toque/clic como un objeto real, sin esperas percibidas ni animaciones "de folleto". Se aplica sobre las utilidades `animate-*` y `transition-*` ya existentes en `index.css` — **no se agregan librerías de animación** (regla #6 de `AGENTS.md`).

## Velocidad: microinteracciones < 200ms

- Todo feedback de interacción se resuelve en **150–200 ms** (`transition-all duration-200`; state 150ms). Si algo debe sentirse instantáneo (presión de botón), no transiciones.
- Un hover con transición de 300ms o más se siente moroso → se acorta.
- El cambio de estado `hover→active` es inmediato; solo la vuelta a `default` puede suavizarse.

## Física: transiciones naturales

- **Press**: `active:scale-[0.98]` al tocar; al soltar vuelve con un pequeño spring (vuelta 150-200ms, easing out corto). Nunca «rebote exagerado» tipo `bounce` por defecto de Tailwind.
- Easing natural: `ease-out`/`ease-in-out` cortos; NO `linear` (se siente mecánico) ni overshoot largo (se siente de caricatura).
- Movimiento que respeta la gravedad: lo que se abre lo hace desde su origen (modal escala desde centro, drawer desliza desde el borde — ya definido en `design.md` §4).

## Presencia: animaciones de entrada (spring dynamics)

- **Entradas**: modales con `animate-scale-up`, paneles/banners con `animate-fade-in`, drawers con `animate-slide-in`, cambios de paso del flujo de reserva con `animate-slide-left` (los 4 ya viven en `index.css`).
- Listas largas (turnos, servicios): entrada con ligero `fade-in` + pequeño offset; opcional stagger por fila de 40–60ms — nada de apariciones "todo a la vez" ni spinners infinitos.
- Las entradas tienen una sola dirección dominante por pantalla (no combinar slide-left y scale-up en el mismo momento).
- Salidas rápidas: los cierres de modal/drawer no deben fundirse lentamente (≤ 150ms).

## Pulimento extremo en interactivos

- Transicionar SOLO `transform`/`opacity` (y `background-color`/`box-shadow` puntuales). Nunca animar `left/top/width/height` (reflow/jank).
- El hover comunica affordance antes del clic (tint + borde); el `active` da el clic físico; el `focus-visible` nunca se pierde (ver `impeccable-design`).
- Botones con operación (Agendar, Cancelar, Guardar): al ejecutar, contenido → `Loader2` girando **sin cambiar el ancho** del botón (ancho estable o `w-full`).
- Chips de horario: seleccionar cambia `scale` + color en el mismo frame (150ms), para que el toque se sienta "marcado" al instante.
- Confirmar/cancelar en modales: el botón destructivo se deshabilita mientras corre la operación; feedback de éxito inline (banner emerald, se desvanece en ~3.5s según `design.md` §6.4).

## Reduced motion

- Respetar `prefers-reduced-motion`: en este caso se mantienen los cambios de estado (color/estado) pero se omiten las animaciones de presencia y lo que no sea esencial. Nunca animar contenido en loop fuera de spinners.

## Procedimiento

1. Identificar el momento de la interacción: press / hover / entrada / salida / carga.
2. Escoger la utilidad existente (`animate-*`) o `transition-[prop] duration-200` correcta; no inventar keyframes nuevos si ya existe uno equivalente.
3. Asegurar que el estado `disabled`/cargando no mueve el layout.
4. Autorevisión: cualquier animación que se note "más lenta que un parpadeo" se revisa contra los 200ms.