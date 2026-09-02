# AGENTS.md — Backend OptiTurno

Contexto específico del backend (Fastify + Supabase). Léelo junto con el `AGENTS.md` raíz.

## Estructura y responsabilidades

```
src/
├── app.ts                      # Fastify: CORS, registro de rutas, health check
├── config/database.ts          # Clientes Supabase: `supabase` (service role) y `supabaseAuth` (anon para login)
├── middlewares/auth.middleware.ts  # verificarAutenticacion (JWT) + permitirRoles([...])
├── routes/                     # Definición de rutas (turnos, usuarios, negocios, pagos, profesionales)
├── controllers/                # Handlers: parseo de body/query, respuestas HTTP
└── services/                   # Lógica de negocio: queries Supabase, validaciones
```

## Comandos

```bash
pnpm dev              # tsx watch src/app.ts (puerto 5000)
pnpm build            # tsc → emite .js (hoy junto a los .ts; outDir a dist/ es pendiente)
npx tsc --noEmit      # typecheck obligatorio antes de terminar

# Base de datos local (Docker)
pnpm db:start         # Levanta Supabase local (Postgres + Auth + API)
pnpm db:stop          # Detiene los contenedores
pnpm db:reset         # Resetea BD + corre migraciones + seed
pnpm db:migration     # Crea nueva migración SQL
pnpm db:status        # Estado de los contenedores
```

## Base de datos local (Supabase CLI + Docker)

El proyecto usa Supabase CLI para desarrollo local. Al ejecutar `pnpm db:start`:

- **PostgreSQL** corre en `localhost:54322` (免得 conflicte con PG local en 5432)
- **PostgREST API** en `localhost:54321` (el `SUPABASE_URL`)
- **Auth** en `localhost:54321/auth/v1`
- **Studio** (dashboard visual) en `localhost:54323`

Las migraciones viven en `supabase/migrations/` y el seed en `supabase/seed.sql`.

**Importante**: el seed.sql crea datos en las tablas públicas, pero los usuarios de Auth (`auth.users`) se crean vía la API admin o el Studio. Al hacer `db reset`, crea solo las tablas; los usuarios de Auth se crean con `supabase.auth.admin.createUser()` desde el backend o el Studio.

## Env (.env local, no versionar — ver .env.example)

- `PORT` (5000), `NODE_ENV`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` → cliente admin `supabase` (operaciones de escritura)
- `SUPABASE_ANON_KEY` → cliente `supabaseAuth` (login con signInWithPassword). Fallback legacy: `SUPABASE_KEY`.
- `CORS_ORIGINS` → whitelist de orígenes separados por coma (default: `http://localhost:4000,http://127.0.0.1:4000`). Nunca `origin: true`.
- `PAGOS_WEBHOOK_SECRET` → secret HMAC del webhook de pagos. Sin él, `/api/pagos/webhook` responde 503 (deshabilitado por defecto). Firma esperada: header `x-webhook-firma` = HMAC-SHA256(`${evento}.${transaccionId}`, secret).

Si falta `SUPABASE_ANON_KEY`, el login devuelve "El login no esta disponible" — el login se hace con el cliente anónimo, NO con el service role.

## Patrones obligatorios

1. **Auth**: rutas protegidas con `preHandler: [verificarAutenticacion, permitirRoles([...])]`. Rutas públicas: solo las de catálogo/disponibilidad/registro/login. Los endpoints de escritura (`/api/negocios/*`, `/api/profesionales/`, `/api/seed`) requieren `admin_negocio`/`superadmin`.
2. **Roles**: `cliente`, `admin_negocio`, `superadmin`. En registro público, el rol se valida contra una whitelist (`cliente | admin_negocio`) en el service — `superadmin` NUNCA se acepta del body.
3. **El `cliente_id` de una reserva sale de `request.usuario!.id`** (JWT), nunca del body.
4. **Errores**: responder mensajes genéricos en español; `err.message` solo a logs. Formato de error: `{ error: string }`.
5. **Códigos**: conflicto de horario (GIST 23P01 / `no_solapar_turnos`) → 409; turno de otro usuario → 403; no existe → 404; ya cancelado → 409.
6. **Nunca** modifiques los `.js` de `src/` (compilación obsoleta gitignoreada). Trabaja solo en `.ts`.
7. `request.body` llega como `unknown`: cast con interface local del controller (ej. `ReservarTurnoBody`). No usar `as any` a discreción.

## Contratos de API clave

| Ruta | Protección | Notas |
|---|---|---|
| `POST /api/usuarios/registrar` | Pública | Crea en Supabase Auth + perfil en `usuarios` |
| `POST /api/usuarios/login` | Pública | Devuelve `{ token, usuario }` |
| `GET/PUT /api/usuarios/me` | JWT | Perfil propio |
| `GET /api/sucursales/:id/servicios` y `/profesionales` | Públicas | Catálogo |
| `GET /api/turnos/disponibilidad` | Pública | Query `{ profesional_id, fecha }` |
| `POST /api/turnos/reservar` | JWT (cliente) | Body: `profesional_id, servicio_id, fecha, hora_inicio` |
| `GET /api/turnos/mios` | JWT (cliente) | Historial del cliente |
| `PATCH /api/turnos/:id/cancelar` | JWT (cliente) | Valida propiedad |
| `POST /api/turnos/limpiar-expirados` | admin_negocio/superadmin | |
| `POST /api/seed` | superadmin | Datos demo |
| `POST /api/pagos/webhook` | Firma HMAC (`x-webhook-firma`) | `{ transaccionId, evento }`; sin `PAGOS_WEBHOOK_SECRET` responde 503 |

## Queries y datos

- Tablas: `usuarios`, `negocios`, `sucursales`, `servicios`, `profesionales`, `turnos`, `pagos_garantia`, `horarios_laborales`, `intenciones_de_pago`.
- Los joins de `turnos` suelen incluir `servicios (nombre, precio)` y `profesionales (especialidad) → usuarios (nombre)`.
- El seeder de `negocios.service.ts` es la fuente de datos demo (UUIDs fijos 11111111-…/22222222-…).
- Cuidado con el typo histórico `descripción` (con tilde) en un SELECT de servicios — verificar contra el esquema real.