# AGENTS.md — Frontend OptiTurno

Contexto específico del frontend (React 19 + Vite 6 + Tailwind 4). Léelo junto con el `AGENTS.md` raíz.

## Estructura

```
src/
├── App.tsx                 # Router (react-router-dom): landing / PWA cliente / panel admin / 404 + SEO por ruta
├── main.tsx                # Bootstrap + BrowserRouter
├── index.css               # Tailwind 4 + animaciones CSS (slideIn, slideLeft, fadeIn, scaleUp)
├── types.ts                # Tipos UI (Service, BookingEvent, DayAvailability, ActivityLog)
├── types/enums.ts          # Uniones Rol / EstadoTurno / EstadoServicio (+ ROLES_SISTEMA, ESTADOS_TURNO)
├── contexts/               # Contextos (AbrirVistaClienteContext para navegación admin→cliente)
├── hooks/useSEO.ts         # Título + meta description/OG por ruta (mapa en el archivo)
├── layouts/AdminLayout.tsx # Shell del panel admin (sidebar + drawer + breadcrumbs + Outlet)
├── utils/                  # analytics.ts (GA4 silencioso) · ultimoTurno.ts (respaldo de /confirmacion)
├── data.ts                 # Datos demo seed (servicios, turnos, logs, equipo)
├── components/             # Vistas, sub-componentes, páginas (Landing, NotFound, ConfirmacionView…)
├── api/                    # Capa HTTP: client axios + DTOs + llamadas por dominio
├── data/
│   ├── index.ts            # Factory de repositorios: mock vs API según usarMocks()
│   ├── session.ts          # Persistencia de sesión (localStorage) — ÚNICA vía permitida
│   ├── mappers.ts          # DTO → tipos UI
│   └── repos/              # Repos mock y API por dominio (auth, turnos, servicios…)
├── store/index.ts          # Estado global useSyncExternalStore + acciones async
└── config/env.ts           # VITE_* → constantes (MODO_DEMO, API_URL, GA_MEASUREMENT_ID…)
```

## Comandos

```bash
pnpm dev              # vite --port=4000 (host 0.0.0.0)
pnpm build            # vite build
npx tsc --noEmit      # typecheck obligatorio
```

## Flujo de datos (no romper)

Componente → acción del store → `repositorios.<dominio>` (mock o API según `usarMocks()`) → fallback automático a mock si la API falla.

- En modo demo (`VITE_USE_MOCKS=true`) no se necesita backend: login demo `admin@optiturno.com / password123` (comercio), `cliente@optiturno.com / password123` (cliente demo), `empleado@optiturno.com / password123` (profesional).
- Al agregar un endpoint al backend: crear contraparte **mock Y API** en `data/repos/` (regla #3 del AGENTS raíz).
- Los repos API que no tienen endpoint implementado hacen `throw new Error("...")` — el fallback del store los absorbe.

## Estado global (store)

- `useStore((s) => s.x)` con `useSyncExternalStore`. NO agregar Redux/Zustand.
- Estado: `sesion`, `servicios`, `turnos`, `logs`, `equipo`, `misTurnos`, `ausencias`, `usuarios`, `misTurnosCargando`, `error`, `cargando`, `inicializado`.
- Acciones: `login`, `registrar`, `logout`, `cargarMisTurnos`, `cancelarTurnoCliente`, `actualizarPerfil`, `guardarServicio`, `eliminarServicio`, `reservarTurno`, `cancelarTurno`, `guardarDisponibilidad`, `cargarAusencias`, `crearAusencia`, `eliminarAusencia`, `cargarHorarioEmpleado`, `guardarHorarioEmpleado`, `cargarUsuarios`, `editarUsuario`, `agregarLog`.
- `logout()` NO resetea los caches de los repos mock (pendiente de fix): no asumir limpieza.

## Sesión (regla #1 del AGENTS raíz)

- Claves: `optiturno_token` y `optiturno_sesion`. Todo acceso vía `data/session.ts`.
- Interceptor axios (`api/api.client.ts`) inyecta `Authorization: Bearer <token>` y limpia token en 401.
- Roles comparados como string: `sesion.usuario.rol === "cliente"`.

## Vistas y navegación (react-router-dom v7)

Rutas definidas en `App.tsx`. Los layouts (`ClientShell`, `AdminLayout`) sirven de "gate": sin sesión muestran `AccessAuth` inline (no redirigen), igual que la app original.

| Ruta                                 | Vista                                     | Notas                                                                        |
| ------------------------------------ | ----------------------------------------- | ---------------------------------------------------------------------------- |
| `/`                                  | `Landing` (hero CRO + auth + testimonios) | Si hay sesión redirige a `/reservar` o `/admin`                              |
| `/reservar`                          | `ClientPwa` (wizard 3 pasos)              | El éxito navega a `/confirmacion`                                            |
| `/turnos`                            | `MisTurnosView`                           |                                                                              |
| `/perfil`                            | `MiPerfilView`                            |                                                                              |
| `/confirmacion`                      | `ConfirmacionView`                        | Lee `location.state` → `utils/ultimoTurno.ts` (sessionStorage) → `misTurnos` |
| `/admin`                             | AdminLayout + `AdminDashboard`            |                                                                              |
| `/admin/{calendario,disponibilidad}` | AdminCalendar / AdminAvailability         | Todos los roles admin                                                        |
| `/admin/{catalogo,equipo,perfil}`    | AdminCatalog / AdminTeam / AdminProfile   | `SoloNoEmpleado` redirige `empleado` → `/admin`                              |
| `/admin/usuarios`                    | AdminUsers                                | `SoloSuperadmin`                                                             |
| `*`                                  | `NotFound` (404)                          |                                                                              |

- Breadcrumbs URL-based: `components/Breadcrumbs.tsx` (mapa `MIGAS_POR_RUTA`).
- `StickyMobileCTA`: barra CTA fija solo móvil (`md:hidden`), contextual por ruta, oculta en `/reservar`.
- Confirmación ya NO es el paso 5 inline: `TicketResumen.tsx` fue eliminado. Los placeholders de `alert()` (Google Calendar/WhatsApp) se reemplazaron por deep links reales (`calendar.google.com/calendar/render`, `wa.me`).
- Acceso admin → cliente sigue vía `AbrirVistaClienteContext` (provisto por `AdminLayout` usando `useNavigate`), sin `window`.
- SEO: `hooks/useSEO.ts` actualiza `title`/`meta` por ruta; `utils/analytics.ts` registra pageviews GA4 en cada cambio de `pathname` (silencioso en localhost y sin `VITE_GA_MEASUREMENT_ID`).
- Al desplegar en Vercel: `vercel.json` reescribe toda ruta a `/index.html` (SPA) — no romper ese rewrite o los deep links y el 404 devuelven 404 reales.

### Roles y permisos

- **cliente** → PWA en `ClientShell` (sidebar escritorio / drawer hamburguesa móvil).
- **admin_negocio/superadmin** → panel admin (`AdminLayout`) con tabs: dashboard, calendar, catalog, availability, profile.
- **superadmin** → tab adicional **Usuarios** (`AdminUsers`): lista usuarios, cambia correo (único) y rol; el propio rol está bloqueado. El mock de registros agrega la cuenta nueva vía `agregarUsuarioMock` para que aparezca en la lista.
- **empleado** → mismo panel pero SOLO tabs dashboard, calendar, availability ("Modo: Mi Semana" + sección "Mis Ausencias y Vacaciones"); sin Catálogo/Equipo/Editar Comercio (URLs también bloqueadas).
- Alertas ausencias: cuando el backend o el mock rechazan una reserva por ausencia, el mensaje genérico es "El profesional no está disponible en esa fecha." / "...en ese horario.".

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
- `rol` y `estado` están tipados con las uniones de `api/dto.ts` y `types/enums.ts` (`Rol`, `EstadoTurno`, `EstadoServicio`) — validar contra los valores conocidos al comparar.
- `ReservarTurnoInput` (UI, incluye `cliente_nombre`/`servicio_nombre`) vs `ReservarTurnoInputDTO` (API) son distintos a propósito; mapear en el repo.
- `BookingEvent` (types.ts) no tiene campo `fecha`: el calendario admin es de día único por diseño actual.
