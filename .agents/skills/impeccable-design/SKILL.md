---
name: impeccable-design
description: Rigor de diseño impecable para OptiTurno: cero inconsistencias en paddings, grids alineados y estados de componentes bien definidos (hover, active, focus, disabled). Use when creando o refactorizando componentes y vistas de la PWA o el panel admin, cuando importe la consistencia milimétrica y los estados interactivos.
---

# Impeccable Design — Cero inconsistencias

Reglas de precisión para que la interfaz de OptiTurno se sienta "intervenida": cada padding, gap, alineación y estado es el mismo en todo el sistema. Todo contra los tokens de `design.md`.

## Espaciado impecable (8px grid)

- Usar SOLO la escala de Tailwind listada en `design.md` §4 (`1, 1.5, 2, 3, 3.5, 4, 5, 6, 8`). Jamás valores arbitrarios (`p-[17px]`, `gap-[11px]`).
- Paddings canónicos de tarjetas: `p-4` móvil / `p-5`–`p-6` escritorio. La misma tarjeta de turno tiene el mismo padding en la PWA que en el panel admin.
- Modales/drawers SIEMPRE `p-4` alrededor y `w-full max-w-sm`; barras de sección con el mismo padding vertical que el contenido.
- Dentro de listas: `space-y-3`/`space-y-4` de forma consistente por nivel (cards vs filas sueltas).

## Grids alineados

- Todas las cards de una lista comparten el mismo gutter y el mismo radio; los bordes exteriores alinean al mismo eje.
- Iconos dentro de texto/botones: `inline-flex items-center gap-2`, centrado óptico (no manual).
- Botones hermanos en un grupo (p. ej. modal: Cancelar / Confirmar) tienen el mismo alto y ancho proporcional; no uno largo y otro corto.
- Etiquetas de formulario alineadas al mismo eje que los inputs (`label-overline` donde aplique).
- El contenido de una columna no "flota" con alineaciones distintas entre cards: el mismo empezar (p. ej. nombre del servicio) está a la misma x.

## Estados de componentes bien definidos

Todo componente interactivo define estos 5 estados — nunca faltan ni son ambigüos:

| Estado | Regla general |
|---|---|
| **default** | El visual base del componente (ver `design.md` §5) |
| **hover** | Señal clara de interactividad: tint de fondo + borde (`hover:bg-slate-100` en ghost, `hover:bg-primary-hover` en primario). No solo cambiar el cursor |
| **active/pressed** | Respuesta física: `active:scale-[0.98]` + color más profundo (`bg-primary` → `indigo-800`) |
| **focus-visible** | Anillo 2px `var(--primary)` con offset 2px. NUNCA se elimina `outline` |
| **disabled** | `opacity-60 cursor-not-allowed`, sin hover y sin pointer; no cambia de color a "rojo" salvo que sea semántico |

Referencias por componente:

- **Botones** (`.btn`, `.btn-*`): los 5 estados definidos en `@layer components`; en modal destructivo, el botón de confirmación queda `disabled` + `Loader2` mientras la operación corre.
- **Chips de horario** (`chip*`): default/selected/disabled ya definidos en `design.md` §5.4; nunca combinar `chip-selected` con `chip-disabled` en el mismo slot.
- **Inputs** (`.input`): default/carga/foco(anillo `primary/15`)/error(`aria-invalid` + borde rojo + `aria-describedby`)/disabled(`opacity-60`).
- **Cards clicables** (profesonal, servicio): hover = borde indigo + `shadow-sm`; seleccionado = borde indigo oscuro + tint; teclado = `focus-visible` interno.
- **Icon-botones** (menú, toggle, X de modal): 44px objetivo, `aria-label`, estados iguales a los del botón ghost.

## Checklist de rigor (autorevisión)

- [ ] Ningún `px-[…]`/`m-[…]` con valores fuera de la escala.
- [ ] Cards hermanas con el mismo padding, radio y gap.
- [ ] Botones hermanos con el mismo tamaño; la acción destructiva a la derecha.
- [ ] Pendiente de estados: cada componente tiene los 5 estados y `disabled` no reacciona.
- [ ] Foco visible nunca eliminado; objetivos ≥ 40px (≥ 44px en listas/menús).
- [ ] Errores no mueven el layout (espacio reservado o banner debajo del bloque).
- [ ] Estados de carga no "saltan": mismo alto que el contenido que reemplazan.