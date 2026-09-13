# AGENTS.md — OptiTurno

Memoria de contexto para agentes de IA y desarrolladores. Léelo completo antes de tocar código.

## Propósito

OptiTurno es un SaaS de agendamiento inteligente para comercios de servicios presenciales (barberías, estética, salud). Tiene dos experiencias:

- **Cliente**: PWA ultraligera (Reservar Cita, Mis Turnos, Mi Perfil) accesible tras registro/login.
- **Comercio**: panel admin (Dashboard, Calendario Maestro, Catálogo, Disponibilidad, Onboarding).

## Stack (no cambiar sin justificación)

| Área            | Tecnología                                                                      |
| --------------- | ------------------------------------------------------------------------------- |
| Monorepo        | pnpm workspaces (`pnpm-workspace.yaml`)                                         |
| Backend         | Node 24 + Fastify 5 + TypeScript + Supabase (Postgres + Auth + RLS)             |
| Frontend        | React 19 + Vite 6 + Tailwind CSS 4 + axios + lucide-react + react-router-dom v7 |
| Estado frontend | `useSyncExternalStore` (NO usar Redux/Zustand)                                  |
| Datos frontend  | Repository pattern mock/API con fallback automático                             |
| Auth            | JWT de Supabase; sesión persistida en localStorage                              |

## Estructura

```
backend/src/          app.ts · config/ · middlewares/ · routes/ · controllers/ · services/ · errors/ · plugins/ · schemas/
frontend/src/         App.tsx · components/ · api/ · data/repos/ · store/ · config/ · contexts/ · types/
Collections/          Colecciones Bruno (tests manuales de API)
```

## Calidad

- ESLint flat (`eslint.config.mjs`) + Prettier + Husky (pre-commit con lint-staged) + commitlint (conventional commits: `feat:`/`fix:`/`refactor:`/`docs:`/`style:`/`test:`).
- CI en GitHub Actions (`.github/workflows/ci.yml`): lint + `prettier --check` + typecheck + builds en cada push a `main` y PRs.
- Toda validación de payload del backend pasa por zod (`backend/src/schemas/*.schemas.ts` + helper `validarCuerpo`); `@typescript-eslint/no-explicit-any` es error (no queda `any` en el código).

## Comandos

```bash
# Backend (en backend/)
pnpm dev              # tsx watch src/app.ts (puerto 5000)
pnpm build            # tsc → emite a dist/
npx tsc --noEmit      # typecheck

# Frontend (en frontend/)
pnpm dev              # vite --port=4000
pnpm build            # vite build
npx tsc --noEmit      # typecheck

# Raíz
pnpm build:frontend   # build del frontend (usado por Vercel)
```

**No hay tests automatizados todavía.** Antes de commit (pasa por hooks de Husky): `pnpm lint`, `pnpm exec prettier --check .` y `npx tsc --noEmit` en frontend y backend.

## Variables de entorno

- **Backend** (`backend/.env`, no versionar): `PORT`, `NODE_ENV`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY` (la usa el cliente anónimo para login).
- **Frontend** (`frontend/.env`): `VITE_API_URL` (default `http://localhost:5000/api`), `VITE_USE_MOCKS` (`true` = modo demo sin backend), `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

`MODO_DEMO` se muestra en la UI; el switch mock/API real ocurre en `frontend/src/data/index.ts` (`usarMocks()`).

## Reglas obligatorias para agentes

1. **Nunca** modifiques la sesión en `localStorage` sin usar `frontend/src/data/session.ts` (claves `optiturno_token` y `optiturno_sesion`).
2. **Nunca** introduzcas secretos en código ni en commits. No crear claves en el frontend que no sean `VITE_*`.
3. **Nunca** rompas el fallback mock: todo endpoint del backend debe tener contraparte mock en `frontend/src/data/repos/`.
4. Mantén la convención de commits: prefijos `feat:`, `fix:`, `refactor:`, `docs:`, `style:`, `test:` en español/inglés, mensaje descriptivo.
5. Antes de terminar una tarea: `pnpm lint`, `pnpm exec prettier --check .` y `npx tsc --noEmit` (frontend y backend). Verifica con `pnpm build` si tocas configs de build.
6. No agregues librerías de estado ni de animación nuevas (hay patrones existentes para ambas).
7. Componentes de React: máximo ~200 líneas; si crecen, dividir en sub-componentes en `frontend/src/components/`.
8. No uses `window` como canal de comunicación entre componentes (reemplazar con Context). No uses `document.getElementById` para interacción React (usar refs).
9. Errores: nunca expongas `err.message` interno al cliente; responde mensajes genéricos + log.

## Convenciones de datos

- Uniones frontend en `frontend/src/types/enums.ts`: `Rol`, `EstadoTurno` (`pendiente_pago | confirmado | cancelado | completado`), `EstadoServicio` (`Activo | Pausado`).
- Roles: `cliente | admin_negocio | superadmin | empleado` (tabla `usuarios`). `empleado` = profesional registrado con su cuenta; en el panel solo gestiona su propio horario y ausencias.
- Ausencias: tabla `profesional_ausencias` (día completo = `hora_inicio NULL`; parcial = rango `hora_inicio`/`hora_fin`). El backend y el mock excluyen esas franjas de la disponibilidad y bloquean reservas (409).
- Gestión de usuarios (superadmin): `GET /api/usuarios` y `PATCH /api/usuarios/:id` cambian email (único; 409 si está tomado; sincroniza Supabase Auth con `email_confirm: true`) y rol. Un superadmin no puede degradarse a sí mismo (400).
- Cuentas demo del frontend (mock): comercio `admin@optiturno.com`, cliente `cliente@optiturno.com`, empleado `empleado@optiturno.com` — todas con `password123`.
- El `cliente_id` de una reserva sale del JWT, nunca del body del request.
- Índice GIST `no_solapar_turnos` en `turnos` evita doble reserva (error 23P01 → 409).
- El middleware `verificarAutenticacion` valida JWT; `permitirRoles([...])` controla roles.

## Decisión técnica importante

El `backend/src/**/*.js` está gitignoreado y son restos obsoletos de compilación antigua: **nunca** los edites ni los tomes como referencia; la fuente de verdad es el `.ts`. (Pendiente: fijar `outDir` a `dist/` y eliminar los `.js`.)

## Bugs/estado conocido (a febrero 2026)

- Login del backend requiere `SUPABASE_ANON_KEY` en `.env` (el nombre `SUPABASE_KEY` es legacy; verificar ambos).
- Dashboard y calendario admin usan datos demo hardcodeados (KPIs, fechas, "4 Citas") — es visualización, no datos reales.
- Sin tests automatizados: está en la hoja de ruta de calidad (lint, formato y typecheck ya cubiertos por CI y hooks).
