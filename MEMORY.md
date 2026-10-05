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

- Aplicar en el SQL editor de Supabase prod las migraciones **00005, 00006, 00007, 00008 y 00009** (y futuras, empezando por `00010`). Se hicieron localmente; la aplicación a prod quedó a cargo del usuario (vía SQL editor). Verificar que `/api/turnos` y `/api/turnos/mios` ya no devuelvan 500.
- **Redis NO está provisionado**: `REDIS_URL` vacío → el backend usa caché en memoria (fallback). Recomendado: Upstash free tier; luego setear `REDIS_URL` en Render.

## Trabajo reciente (commits)

| Commit    | Qué                                                                                                                 |
| --------- | ------------------------------------------------------------------------------------------------------------------- |
| `30ffa9d` | docs: incorporar guías de TDD, habilidades de agentes y control de dependencias                                     |
| `6a12909` | fix: scroll vertical en grilla diaria del calendario maestro (body `flex-1 min-h-0 overflow-y-auto`, header sticky) |
| `144622b` | feat: sincronización Realtime de turnos (Cliente↔Admin) + caché Redis backend con fallback en memoria               |
| `5eb38f3` | fix: calendario maestro + desacople de mocks del panel admin                                                        |
| `38b322b` | feat: sistema de reagendamientos y cancelaciones con motivo                                                         |
| `758f9d5` | fix: quita contrasena expuesta y endurece RLS de produccion (F0 auditoría integral)                                 |
| `8649d21` | fix: endurece seguridad backend, registro solo cliente y headers web (F1, 25 archivos)                              |
| `c2b3499` | feat: agrega paginas legales, banner de cookies y consentimiento rgpd (F2, 19 archivos)                             |
| `ae26bcd` | refactor: dashboard admin con metricas reales y sin data inventada (F3)                                             |
| `7d702da` | fix: accesibilidad wcag en formularios, banners de error y skip link (F4)                                           |
| `f78eb9b` | feat: code-splitting por rutas, vendor chunks y assets seo (F5)                                                     |

### Mejoras previas ya hechas (no repetir)

- **Mis Turnos**: activos = `pendiente_pago | confirmado`; reagendar marca el original `reagendado` y agrega el turno nuevo de la API (mock con paridad).
- **Calendario**: clic en día mensual → vista diaria de esa fecha; grilla diaria con scroll interno y header sticky.
- **Realtime**: `RealtimeSync.tsx` (suscripción `postgres_changes` en `turnos`, debounce 300ms, refresco silencioso en store); migración `00007` (publicación + `REPLICA IDENTITY FULL`). Ya habilitado en prod.
- **Caché backend**: `config/cache.ts` (ioredis + fallback memoria, `leerConCache`, `invalidar`, `CLAVES`). Cubre disponibilidad, turnos, servicios, profesionales, sucursales, horarios, ausencias, actividad. Invalidación en todas las mutaciones.

## En curso / Próximo plan

1. **Registro de novedades**: la **auditoría integral (F0–F6) está COMPLETA** (ver sección abajo). Pendientes de acción manual: aplicar migraciones 00005–00009 en Supabase prod, rotar la contraseña expuesta en commits viejos y decidir reescritura de historial git.
2. **Recordatorios por WhatsApp** — plan aprobado por el usuario, **pendiente de implementar**. Decisiones tomadas:
   - Proveedor: **Meta WhatsApp Cloud API** (oficial).
   - Ventanas: **24h + 2h antes** del turno (configurable `RECORDATORIOS_HORAS=24,2`).
   - Destinatario: **solo el cliente** (`turnos.cliente_id → usuarios.telefono`).
   - Seguimiento: **tabla `notificaciones` + logs** (sin UI; fase 2 agregará vista admin con repo mock+API).
   - Diseño clave: `UNIQUE(turno_id, ventana_horas)` para idempotencia; ventanas calculadas como timestamps naive en `TZONA_HORARIA` (`America/Bogota`); plugin `setInterval` + endpoint `POST /api/recordatorios/procesar` (`x-cron-secret` o JWT admin); interfaz `ProveedorWhatsApp` con `MetaCloudApiProvider` (fetch, sin libs nuevas) + `LogProvider` dev (dry-run). Prerrequisitos manuales de Meta (WABA, token, plantilla `recordatorio_turno`) documentados en el plan.
   - Archivos previstos: **migración `00010_notificaciones.sql`** (NOTA: 00008 = hardening RLS y 00009 = consentimientos RGPD ya están ocupadas), `config/whatsapp.ts`, `services/whatsapp.service.ts`, `services/recordatorios.service.ts`, controller+routes+plugin `recordatorios`, cambios en `app.ts` y `.env.example`, commit `feat:`.
3. **Fase 2 (posterior, no iniciada)**: vista admin de historial de notificaciones (repo mock+API), toggle por comercio, mensaje de confirmación al reservar, recordatorio al profesional, cancelación/reagendamiento al cliente.

## Auditoría integral (F0–F6) — COMPLETADA

Ejecutada en fases con commits en español; cada fase verificada con `tsc --noEmit` (backend y frontend), `pnpm lint`, `pnpm exec prettier --check .` y builds.

- **F0 — RLS/secretos**: placeholder en `setup_produccion.sql` (`REEMPLAZAR_CONTRASENA_INICIAL`) + migración `00008_hardening_rls_produccion.sql` (revoca privilegios a anon/authenticated y elimina políticas dev). La contraseña `GomezFlorez27!` quedó en commits viejos → **rotación pendiente**.
- **F1 — Seguridad backend**: helmeta+rate-limit (`app.ts`), honeypot anti-spam + registro solo `cliente`, campos `web`, validación `z.uuid()` en IDs y happy multi-tenant (servicios/profesionales/turnos con `verificarPertenenciaSucursalService`/`verificarRecursoDeSucursalService`), fix `limpiarTurnosExpiradosService` (→ `cancelado`, `cancelado_por: "sistema"`), headers de seguridad en `vercel.json`, `eslint.config.mjs` ignora `.agents/**`.
- **F2 — Legal/RGPD**: páginas `/privacidad`, `/terminos`, `/cookies`, `/aviso-legal` (placeholders de razón social/NIT/email en `data/legal.ts`), `CookieBanner` con `localStorage("optiturno_consentimiento")`, GA4 solo con consentimiento `"aceptadas"` (`utils/analytics.ts`), consentimiento obligatorio en registro y reserva (backend exige `true`, migración `00009_consentimientos_rgpd.sql`).
- **F3 — Contenido/confianza**: `AdminDashboard.tsx` reescrito con métricas reales del store (ingresos del mes, reservas activas, citas de hoy, % cancelaciones, actividad real); **eliminados** KPIs falsos ($14.2M, 48 citas, 18.4%…), gráficos `picos7D/30D`, logs simulados cada 12s, banner "Inteligencia Predictiva" y rating falso "5.0 (250 reseñas)" del catálogo cliente.
- **F4 — Accesibilidad WCAG**: skip link + landmarks `main id="contenido"` en todas las rutas (incluye Landing, PaginaLegal), `role="alert"` en 7 banners de error, `htmlFor`/`id` en labels de AccessAuth, MiPerfil, reagendamiento y modales, `aria-label` en selects/inputs del admin. Ya existían `lang="es"`, `:focus-visible` y `prefers-reduced-motion`.
- **F5 — Rendimiento/SEO**: `React.lazy` por ruta + `manualChunks` (router/supabase/http/icons) → chunk principal **745 kB → 237 kB** (gzip 74 kB), sin warning >500 kB. Assets en `frontend/public/`: `favicon.svg`, `apple-touch-icon.svg`, `og-image.svg`, `robots.txt`, `sitemap.xml` (dominio `https://optiturno.com` — **verificar dominio en Vercel**). Se eliminaron deps muertas `motion` y `@google/genai` (eran del simulador F3).
- **F6 — Informe final**: nota de riesgo restante actualizará `AGENTS.md` si se decide (2.4.11 elegible vía sticky bars + `scroll-margin-top` ya aplicado en anclas).

**Riesgos residuales (documentados, no bloqueantes):**

1. Contraseña inicial expuesta en historial git + `SUPABASE_ANON_KEY` legacy: **rotar password de BD y decidir reescritura de historial**.
2. Backend usa `service_role` (bypasa RLS) — RLS es defensa en profundidad; migraciones 00005–00009 **sin aplicar en prod** (acción manual en SQL editor).
3. `crearNegocio`/`crearSucursal` todavía permiten `admin_negocio` (onboarding lo necesita; supuesto monotenant MVP — reevaluar en multi-tenant real).
4. Redis sin provisionar (`REDIS_URL` vacío → caché en memoria).
5. Sin tests automatizados (lint/formato/typecheck cubiertos por CI + Husky).

## Hallazgos / deuda técnica

- **RESUELTO (F1)**: bug `limpiarTurnosExpiradosService` — ahora escribe `estado: "cancelado"` + `cancelado_por: "sistema"` + `motivo_cancelacion` (compatible con el CHECK de `00006`).
- **RESUELTO (F3)**: el dashboard admin usaba datos hardcodeados (KPIs, "4 Citas", logs simulados) — ahora usa métricas reales del store.
- No hay tests automatizados (hoja de ruta de calidad: lint/format/typecheck cubiertos por CI + Husky).
- `backend/src/**/*.js` gitignoreado = restos de compilación obsoleta; NUNCA editar. Pendiente: fijar `outDir` a `dist/`.
- Frontend: `dist/` no se commitea; Vercel build vía `pnpm build:frontend`.

## Paquetes/proveedores aprobados

- Sin dependencias nuevas salvo justificación: backend solo usa `fastify`, `@fastify/cors`, `dotenv`, `@supabase/supabase-js`, `ioredis`, `zod`. WhatsApp vía `fetch` nativo (Node 24) — no agregar SDK.
- Excepción aprobada: `@node-cron/fastify` + `node-cron` para los recordatorios (el usuario eligió explícitamente este paquete frente a `@fastify/schedule`).

## Recordatorios WhatsApp / Evolution API

Decisiones del usuario: **solo turnos `confirmado`**, **cadencia horaria** (`0 * * * *`, `America/Bogota`, `noOverlap`), **ventana 24 h** (turnos de mañana), y **endpoint manual** para disparar el envío bajo demanda.

- Evolution API v2 corre **fuera del repo**, en `~/.evolution-api` (compose con `evoapicloud/evolution-api:v2.3.7` + Postgres interno obligatorio en v2). API key en `~/.evolution-api/.env` (chmod 600), nunca versionada. Aliases en `~/.bashrc`: `evolutionon`, `evolutionoff`, `evolutionstatus`, `evolutionqr` (abre `/manager`). Instancia: `optiturno` (Baileys). El QR todavía no se ha escaneado → envío real pendiente de verificación.
- Backend: `config/whatsapp.ts` (zod, deshabilitado si falta `WHATSAPP_API_KEY`), `services/whatsapp.service.ts` (`POST /message/sendText/:instancia` con `fetch` + timeout), `services/recordatorios.service.ts` (idempotencia por `UNIQUE(turno_id, ventana_horas)`, máximo 3 intentos, degrada sin lanzar), `plugins/recordatorios.ts` (cron), `POST /api/recordatorios/procesar` (header `x-cron-secret`) y `GET /api/recordatorios/estado` (solo `superadmin`/`admin_negocio`).
- Migración `00010_notificaciones.sql`: tabla `notificaciones` (`estado` pendiente/enviado/fallido, `intentos`, `error`, `enviado_en`), RLS cerrado para `anon`/`authenticated` (solo `service_role`).
- **Bug encontrado y corregido**: `00008_hardening_rls_produccion.sql` fallaba en un `db:reset` limpio (`DROP POLICY` sobre `pagos_garantia`, tabla eliminada en `00003`). Ahora usa bloques `DO` que verifican `information_schema`. Esto también rompía aplicar 00008 en prod.
- Verificado end-to-end contra Supabase local: filtra `pendiente_pago`, normaliza teléfono a `573102222222`, escribe/actualiza `notificaciones` y respeta el tope de intentos. Falta verificar el envío exitoso real (requiere escanear el QR).
