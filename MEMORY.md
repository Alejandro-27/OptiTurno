# MEMORY.md — Memoria persistente del proyecto OptiTurno

> **Para agentes y para mí.** Este archivo es la memoria viva del proyecto: estado actual, decisiones en curso, pendientes y hábitos del usuario. `AGENTS.md` (raíz + `backend/` + `frontend/`) es la referencia estática de reglas/stack; **este archivo registra lo que cambia**. Léelo al comenzar y **actualízalo cada vez que algo cambie** (feature terminada, decisión nueva, bug encontrado, migración aplicada, commit relevante).

## Reglas de mantenimiento (para agentes)

1. Al terminar cualquier tarea, verificar si este archivo quedó desactualizado y editarlo.
2. Cambios de estado: mover items de "En curso" → "Hecho" / "Pendiente".
3. No duplicar lo que vive en `AGENTS.md` (stack, comandos, reglas obligatorias): acá va **estado y contexto**, no reglas estáticas.
4. Mantener fechas aproximadas y commits para trazabilidad.

## Hábitos y directivas del usuario (NO OLVIDAR)

- **"Siempre dame el commit, siempre"**: toda tarea termina con commit; convención conventional commits en **español**, subject en **minúsculas** (`feat:`, `fix:`, `refactor:`, `docs:`, `style:`, `test:`). Nunca pushear/PR sin que lo pida.
- **Aprobación de plan antes de implementar**: cuando hay decisiones, presentar plan y esperar el "adelante" (uso `question`/plan con opciones).
- Idioma de conversación y de mensajes de UI/código: **español**.
- Si algo bloquea (herramienta, navegador, credencial), decirlo claramente y dar alternativas.

## Entorno actual

| Ámbito                  | URL / dato                                                                                                                                                                         |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend local           | `http://localhost:5000/api` (`pnpm dev`, tsx watch, puerto 5000)                                                                                                                   |
| Frontend local          | `http://localhost:4000` (Vite)                                                                                                                                                     |
| Supabase local (Docker) | API `127.0.0.1:54321` · Postgres `54322` · Studio `54323` (comandos `pnpm db:*`)                                                                                                   |
| Backend prod            | `https://optiturno.onrender.com/api` (Render)                                                                                                                                      |
| Frontend prod           | Vercel (rewrite SPA en `vercel.json`)                                                                                                                                              |
| Supabase prod           | ref `yeqogjcwsoymujkmdxmx`, SQL editor para migraciones                                                                                                                            |
| Navegador (devtools)    | **Firefox remoto con bridge inestable** (da `can't access property "id" of undefined` al abrir tabs) → verificación visual puede fallar; usar typecheck/build + instancias locales |

**Estado de deployment pendiente (confirmar con el usuario):**

- Aplicar en el SQL editor de Supabase prod las migraciones **00005, 00006, 00007** (y futuras). Se hicieron localmente; la aplicación a prod quedó a cargo del usuario (vía SQL editor). Verificar que `/api/turnos` y `/api/turnos/mios` ya no devuelvan 500.
- **Redis NO está provisionado**: `REDIS_URL` vacío → el backend usa caché en memoria (fallback). Recomendado: Upstash free tier; luego setear `REDIS_URL` en Render.

## Trabajo reciente (commits)

| Commit    | Qué                                                                                                                 |
| --------- | ------------------------------------------------------------------------------------------------------------------- |
| `30ffa9d` | docs: incorporar guías de TDD, habilidades de agentes y control de dependencias                                     |
| `6a12909` | fix: scroll vertical en grilla diaria del calendario maestro (body `flex-1 min-h-0 overflow-y-auto`, header sticky) |
| `144622b` | feat: sincronización Realtime de turnos (Cliente↔Admin) + caché Redis backend con fallback en memoria               |
| `5eb38f3` | fix: calendario maestro + desacople de mocks del panel admin                                                        |
| `38b322b` | feat: sistema de reagendamientos y cancelaciones con motivo                                                         |

### Mejoras previas ya hechas (no repetir)

- **Mis Turnos**: activos = `pendiente_pago | confirmado`; reagendar marca el original `reagendado` y agrega el turno nuevo de la API (mock con paridad).
- **Calendario**: clic en día mensual → vista diaria de esa fecha; grilla diaria con scroll interno y header sticky.
- **Realtime**: `RealtimeSync.tsx` (suscripción `postgres_changes` en `turnos`, debounce 300ms, refresco silencioso en store); migración `00007` (publicación + `REPLICA IDENTITY FULL`). Ya habilitado en prod.
- **Caché backend**: `config/cache.ts` (ioredis + fallback memoria, `leerConCache`, `invalidar`, `CLAVES`). Cubre disponibilidad, turnos, servicios, profesionales, sucursales, horarios, ausencias, actividad. Invalidación en todas las mutaciones.

## En curso / Próximo plan

1. **Recordatorios por WhatsApp** — plan aprobado por el usuario, **pendiente de implementar**. Decisiones tomadas:
   - Proveedor: **Meta WhatsApp Cloud API** (oficial).
   - Ventanas: **24h + 2h antes** del turno (configurable `RECORDATORIOS_HORAS=24,2`).
   - Destinatario: **solo el cliente** (`turnos.cliente_id → usuarios.telefono`).
   - Seguimiento: **tabla `notificaciones` + logs** (sin UI; fase 2 agregará vista admin con repo mock+API).
   - Diseño clave: `UNIQUE(turno_id, ventana_horas)` para idempotencia; ventanas calculadas como timestamps naive en `TZONA_HORARIA` (`America/Bogota`); plugin `setInterval` + endpoint `POST /api/recordatorios/procesar` (`x-cron-secret` o JWT admin); interfaz `ProveedorWhatsApp` con `MetaCloudApiProvider` (fetch, sin libs nuevas) + `LogProvider` dev (dry-run). Prerrequisitos manuales de Meta (WABA, token, plantilla `recordatorio_turno`) documentados en el plan.
   - Archivos previstos: `migration 00008_notificaciones.sql`, `config/whatsapp.ts`, `services/whatsapp.service.ts`, `services/recordatorios.service.ts`, controller+routes+plugin `recordatorios`, cambios en `app.ts` y `.env.example`, commit `feat:`.
2. **Fase 2 (posterior, no iniciada)**: vista admin de historial de notificaciones (repo mock+API), toggle por comercio, mensaje de confirmación al reservar, recordatorio al profesional, cancelación/reagendamiento al cliente.

## Hallazgos / deuda técnica

- **Bug `limpiarTurnosExpiradosService`** (`backend/src/services/turnos.service.ts:119`): escribe `estado: "expirado"` que NO está en el CHECK de `00006` → el update falla contra BD migrada. Fix propuesto: mapear a `cancelado` + `cancelado_por: "sistema"` + `motivo_cancelacion` (commit `fix:` separado, aprobado implícitamente en plan).
- Dashboard y calendario admin usan datos hardcodeados de visualización (KPIs, "4 Citas") — no son datos reales.
- No hay tests automatizados (hoja de ruta de calidad: lint/format/typecheck cubiertos por CI + Husky).
- `backend/src/**/*.js` gitignoreado = restos de compilación obsoleta; NUNCA editar. Pendiente: fijar `outDir` a `dist/`.
- Frontend: `dist/` no se commitea; Vercel build vía `pnpm build:frontend`.

## Paquetes/proveedores aprobados

- Sin dependencias nuevas salvo justificación: backend solo usa `fastify`, `@fastify/cors`, `dotenv`, `@supabase/supabase-js`, `ioredis`, `zod`. WhatsApp vía `fetch` nativo (Node 24) — no agregar SDK.
