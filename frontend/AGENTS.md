# AGENTS.md — Frontend OptiTurno

Contexto específico del frontend (React 19 + Vite 6 + Tailwind 4). Léelo junto con el `AGENTS.md` raíz.

## Estructura

```
src/
├── App.tsx                 # Routing por rol (landing / ClientShell / panel admin) + drawer admin móvil
├── main.tsx                # Bootstrap + ThemeToggle inicial
├── index.css               # Tailwind 4 + animaciones CSS (slideIn, slideLeft, fadeIn, scaleUp)
├── types.ts                # Tipos UI (Service, BookingEvent, DayAvailability, ActivityLog)
├── data.ts                 # Datos demo seed (servicios, turnos, logs, equipo)
├── components/             # Vistas y sub-componentes
├── api/                    # Capa HTTP: client axios + DTOs + llamadas por dominio
├── data/
│   ├── index.ts            # Factory de repositorios: mock vs API según usarMocks()
│   ├── session.ts          # Persistencia de sesión (localStorage) — ÚNICA vía permitida
│   ├── mappers.ts          # DTO → tipos UI
│   └── repos/              # Repos mock y API por dominio (auth, turnos, servicios…)
├── store/index.ts          # Estado global useSyncExternalStore + acciones async
└── config/env.ts           # VITE_* → constantes (MODO_DEMO, API_URL…)
```

## Comandos

```bash
pnpm dev              # vite --port=4000 (host 0.0.0.0)
pnpm build            # vite build
npx tsc --noEmit      # typecheck obligatorio
```

## Flujo de datos (no romper)

Componente → acción del store → `repositorios.<dominio>` (mock o API según `usarMocks()`) → fallback automático a mock si la API falla.

- En modo demo (`VITE_USE_MOCKS=true`) no se necesita backend: login demo `admin@optiturno.com / password123`.
- Al agregar un endpoint al backend: crear contraparte **mock Y API** en `data/repos/` (regla #3 del AGENTS raíz).
- Los repos API que no tienen endpoint implementado hacen `throw new Error("...")` — el fallback del store los absorbe.

## Estado global (store)

- `useStore((s) => s.x)` con `useSyncExternalStore`. NO agregar Redux/Zustand.
- Estado: `sesion`, `servicios`, `turnos`, `logs`, `equipo`, `misTurnos`, `misTurnosCargando`, `error`, `cargando`, `inicializado`.
- Acciones: `login`, `registrar`, `logout`, `cargarMisTurnos`, `cancelarTurnoCliente`, `actualizarPerfil`, `guardarServicio`, `eliminarServicio`, `reservarTurno`, `cancelarTurno`, `guardarDisponibilidad`, `agregarLog`.
- `logout()` NO resetea los caches de los repos mock (pendiente de fix): no asumir limpieza.

## Sesión (regla #1 del AGENTS raíz)

- Claves: `optiturno_token` y `optiturno_sesion`. Todo acceso vía `data/session.ts`.
- Interceptor axios (`api/api.client.ts`) inyecta `Authorization: Bearer <token>` y limpia token en 401.
- Roles comparados como string: `sesion.usuario.rol === "cliente"`.

## Vistas y navegación

- **Sin sesión** → landing con `AccessAuth` (registro/login unificado, selector Cliente|Comerciante).
- **cliente** → `ClientShell` (sidebar escritorio / drawer hamburguesa móvil) con secciones:
  - `Reservar Cita` → `ClientPwa` (flujo 4 pasos: catálogo → fecha/hora → datos → confirmación)
  - `Mis Turnos` → `MisTurnosView` (listar + cancelar con confirm)
  - `Mi Perfil` → `MiPerfilView` (nombre + WhatsApp vía `/usuarios/me`)
- **admin_negocio/superadmin** → panel admin en `App.tsx` con tabs: dashboard, calendar, catalog, availability, profile.
- `window.abrirVistaCliente` (patrón legacy, pendiente de migrar a Context): `AdminProfile` lo usa para saltar a la vista cliente.

## Convenciones de UI

- Tailwind CSS 4 con dark mode por clase `.dark` (custom-variant en `index.css`). `ThemeToggle` persiste en `localStorage("theme")`.
- Iconos: `lucide-react`. Animaciones: clases `animate-*` de `index.css` (no instalar motion).
- Componentes ≤ 200 líneas; si crecen, dividir.
- NO usar `window` para comunicación entre componentes, ni `document.getElementById` para interacción React.
- Modales/drawers con backdrop; toasts con `fixed top-4 right-4` (en móvil `left-4 md:left-auto`).
- Inputs de hora en AdminAvailability son `type="text"` (patrón existente; no cambiar sin razón).
- Errores de usuario: banner rojo `bg-red-500/10 border-red-500/30` con mensaje genérico.

## Tipos y DTOs

- `api/dto.ts`: `UsuarioSesionDTO`, `MisTurnoDTO`, `ServicioDTO`, `LoginUsuarioInput`, `RegistrarUsuarioInput`, `ReservarTurnoInputDTO`.
- `rol` y `estado` son `string` (pendiente de union types) — validar contra los valores conocidos al comparar.
- `ReservarTurnoInput` (UI, incluye `cliente_nombre`/`servicio_nombre`) vs `ReservarTurnoInputDTO` (API) son distintos a propósito; mapear en el repo.
- `BookingEvent` (types.ts) no tiene campo `fecha`: el calendario admin es de día único por diseño actual.