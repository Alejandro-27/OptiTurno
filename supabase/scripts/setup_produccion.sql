-- ============================================================
-- OptiTurno — Setup de la base de datos de producción (Supabase Cloud)
-- ============================================================
-- Cómo usarlo:
--   1) Creá el proyecto: https://supabase.com/dashboard/new/project
--      (nombre: opti-turno; región y plan a elección; guardá la DB password).
--   2) Supabase Dashboard → SQL Editor → New query → pegá este archivo → Run.
--   3) Credenciales: Supabase Dashboard → Settings → API.
--        - Project URL  → SUPABASE_URL (backend) + VITE_SUPABASE_URL (frontend)
--        - anon key     → SUPABASE_ANON_KEY (backend) + VITE_SUPABASE_ANON_KEY (frontend)
--        - service_role → SUPABASE_SERVICE_ROLE_KEY (solo backend, NUNCA en frontend)
--   4) ANTES DE CORRER: reemplazá la contraseña inicial en la sección "0."
--      (aparece 3 veces, una por usuario).
--
-- El script es idempotente: se puede ejecutar de nuevo sin errores.
-- ============================================================

-- ==============================
-- 0. CONTRASEÑA DE LOS USUARIOS INICIALES
-- ==============================
-- Reemplazá 'REEMPLAZAR_CONTRASENA_INICIAL' por una contraseña segura.

DROP TABLE IF EXISTS tmp_contrasena_inicial;
CREATE TEMP TABLE tmp_contrasena_inicial (valor text);
INSERT INTO tmp_contrasena_inicial VALUES ('GomezFlorez27!');

-- ==============================
-- 1. EXTENSIONES
-- ==============================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- ==============================
-- 2. TABLAS (migraciones 00001 + 00002 + 00003 + 00004 unificadas)
-- ==============================

-- 2.1 USUARIOS (espejo de auth.users, con rol propio)
CREATE TABLE IF NOT EXISTS usuarios (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre     TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE,
  telefono   TEXT,
  rol        TEXT NOT NULL DEFAULT 'cliente'
);

-- 2.2 NEGOCIOS
CREATE TABLE IF NOT EXISTS negocios (
  id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  slug   TEXT NOT NULL UNIQUE
);

-- 2.3 SUCURSALES
CREATE TABLE IF NOT EXISTS sucursales (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  negocio_id  UUID NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
  nombre      TEXT NOT NULL,
  direccion   TEXT NOT NULL,
  telefono    TEXT NOT NULL
);

-- 2.4 SERVICIOS (incluye estado Activo/Pausado de la migración 00002)
CREATE TABLE IF NOT EXISTS servicios (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sucursal_id       UUID NOT NULL REFERENCES sucursales(id) ON DELETE CASCADE,
  nombre            TEXT NOT NULL,
  descripcion       TEXT,
  precio            NUMERIC(10,2) NOT NULL,
  duracion_minutos  INTEGER NOT NULL CHECK (duracion_minutos > 0),
  estado            TEXT NOT NULL DEFAULT 'Activo'
                    CHECK (estado IN ('Activo', 'Pausado'))
);

-- 2.5 PROFESIONALES
CREATE TABLE IF NOT EXISTS profesionales (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id  UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  sucursal_id UUID NOT NULL REFERENCES sucursales(id) ON DELETE CASCADE,
  especialidad TEXT
);

-- 2.6 HORARIOS LABORALES
CREATE TABLE IF NOT EXISTS horarios_laborales (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profesional_id UUID NOT NULL REFERENCES profesionales(id) ON DELETE CASCADE,
  dia_semana     INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  hora_inicio    TIME NOT NULL,
  hora_fin       TIME NOT NULL CHECK (hora_fin > hora_inicio)
);

-- 2.7 TURNOS (default 'confirmado' según migración 00003; sin tablas de pagos)
CREATE TABLE IF NOT EXISTS turnos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id      UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  profesional_id  UUID NOT NULL REFERENCES profesionales(id) ON DELETE CASCADE,
  servicio_id     UUID NOT NULL REFERENCES servicios(id) ON DELETE CASCADE,
  fecha           DATE NOT NULL,
  hora_inicio     TIME NOT NULL,
  hora_fin        TIME NOT NULL CHECK (hora_fin > hora_inicio),
  estado          TEXT NOT NULL DEFAULT 'confirmado',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Constraint GIST: evita doble reserva del mismo profesional en el mismo rango.
-- Se envuelve en DO porque ADD CONSTRAINT no soporta IF NOT EXISTS.
DO $$
BEGIN
  ALTER TABLE turnos ADD CONSTRAINT no_solapar_turnos
    EXCLUDE USING gist (
      profesional_id WITH =,
      (tsrange(
        (fecha + hora_inicio)::timestamp,
        (fecha + hora_fin)::timestamp,
        '[)'
      )) WITH &&
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

-- 2.8 AUSENCIAS DE PROFESIONALES (migración 00004)
CREATE TABLE IF NOT EXISTS profesional_ausencias (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profesional_id UUID NOT NULL REFERENCES profesionales(id) ON DELETE CASCADE,
  fecha          DATE NOT NULL,
  hora_inicio    TIME,
  hora_fin       TIME,
  motivo         TEXT NOT NULL DEFAULT 'Ausencia personal',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (hora_fin IS NULL OR hora_inicio IS NULL OR hora_fin > hora_inicio)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_ausencia_dia_completo
  ON profesional_ausencias (profesional_id, fecha)
  WHERE hora_inicio IS NULL;

-- ==============================
-- 3. RLS (habilitado y permisivo: el acceso lo controla el backend con service_role)
-- ==============================
ALTER TABLE usuarios              ENABLE ROW LEVEL SECURITY;
ALTER TABLE negocios              ENABLE ROW LEVEL SECURITY;
ALTER TABLE sucursales            ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios             ENABLE ROW LEVEL SECURITY;
ALTER TABLE profesionales         ENABLE ROW LEVEL SECURITY;
ALTER TABLE horarios_laborales    ENABLE ROW LEVEL SECURITY;
ALTER TABLE turnos                ENABLE ROW LEVEL SECURITY;
ALTER TABLE profesional_ausencias ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'dev_allow_all' AND tablename = 'usuarios') THEN
    CREATE POLICY "dev_allow_all" ON usuarios FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'dev_allow_all' AND tablename = 'negocios') THEN
    CREATE POLICY "dev_allow_all" ON negocios FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'dev_allow_all' AND tablename = 'sucursales') THEN
    CREATE POLICY "dev_allow_all" ON sucursales FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'dev_allow_all' AND tablename = 'servicios') THEN
    CREATE POLICY "dev_allow_all" ON servicios FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'dev_allow_all' AND tablename = 'profesionales') THEN
    CREATE POLICY "dev_allow_all" ON profesionales FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'dev_allow_all' AND tablename = 'horarios_laborales') THEN
    CREATE POLICY "dev_allow_all" ON horarios_laborales FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'dev_allow_all' AND tablename = 'turnos') THEN
    CREATE POLICY "dev_allow_all" ON turnos FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'dev_allow_all' AND tablename = 'profesional_ausencias') THEN
    CREATE POLICY "dev_allow_all" ON profesional_ausencias FOR ALL USING (true);
  END IF;
END
$$;

-- ==============================
-- 4. USUARIOS INICIALES (auth.users + tabla espejo 'usuarios')
-- ==============================
-- Cuentas alineadas con AGENTS.md:
--   admin@optiturno.com   → admin_negocio
--   cliente@optiturno.com → cliente
--   empleado@optiturno.com→ empleado
-- La contraseña sale de la temp table de la sección 0.

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  is_sso_user, is_anonymous
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@optiturno.com',
  crypt((SELECT valor FROM tmp_contrasena_inicial LIMIT 1), gen_salt('bf')),
  now(),
  jsonb_build_object('provider','email','providers',array['email']::text[]),
  jsonb_build_object('nombre','Admin OptiTurno'),
  now(), now(),
  '', '', '', '',
  false, false
ON CONFLICT DO NOTHING;

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  is_sso_user, is_anonymous
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'cliente@optiturno.com',
  crypt((SELECT valor FROM tmp_contrasena_inicial LIMIT 1), gen_salt('bf')),
  now(),
  jsonb_build_object('provider','email','providers',array['email']::text[]),
  jsonb_build_object('nombre','Cliente OptiTurno'),
  now(), now(),
  '', '', '', '',
  false, false
ON CONFLICT DO NOTHING;

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  is_sso_user, is_anonymous
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'empleado@optiturno.com',
  crypt((SELECT valor FROM tmp_contrasena_inicial LIMIT 1), gen_salt('bf')),
  now(),
  jsonb_build_object('provider','email','providers',array['email']::text[]),
  jsonb_build_object('nombre','Empleado OptiTurno'),
  now(), now(),
  '', '', '', '',
  false, false
ON CONFLICT DO NOTHING;

-- Tabla espejo 'usuarios': id = UUID del auth.users (mismo id que el JWT).
-- El backend resuelve el rol desde esta tabla.
INSERT INTO usuarios (id, nombre, email, telefono, rol)
SELECT id, 'Admin OptiTurno', email, '3001112222', 'admin_negocio'
FROM auth.users WHERE email = 'admin@optiturno.com'
ON CONFLICT DO NOTHING;

INSERT INTO usuarios (id, nombre, email, telefono, rol)
SELECT id, 'Cliente OptiTurno', email, '3001113333', 'cliente'
FROM auth.users WHERE email = 'cliente@optiturno.com'
ON CONFLICT DO NOTHING;

INSERT INTO usuarios (id, nombre, email, telefono, rol)
SELECT id, 'Empleado OptiTurno', email, '3001114444', 'empleado'
FROM auth.users WHERE email = 'empleado@optiturno.com'
ON CONFLICT DO NOTHING;

-- Quien ya sea profesional con rol 'cliente' pasa a 'empleado' (paridad con 00004).
UPDATE usuarios
SET rol = 'empleado'
WHERE rol = 'cliente'
  AND id IN (SELECT usuario_id FROM profesionales);

-- ==============================
-- 5. SEED INICIAL DE NEGOCIO
-- ==============================

-- 5.1 Negocio
INSERT INTO negocios (id, nombre, slug)
VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Barbería El Elegante', 'barberia-el-elegante')
ON CONFLICT DO NOTHING;

-- 5.2 Sucursal
INSERT INTO sucursales (id, negocio_id, nombre, direccion, telefono)
VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Sede Central Anapoima',
  'Calle 4 #5-12',
  '3101234567'
)
ON CONFLICT DO NOTHING;

-- 5.3 Servicios
INSERT INTO servicios (sucursal_id, nombre, descripcion, precio, duracion_minutos)
VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Corte de Cabello Premium', 'Incluye lavado y perfilado de cejas', 25000, 30),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Barba Esculpida y Toalla Caliente', 'Ritual tradicional con navaja', 18000, 30),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Combo Rey (Corte + Barba)', 'El servicio completo de la casa', 38000, 60)
ON CONFLICT DO NOTHING;

-- 5.4 Profesionales: admin y empleado atienden en la sucursal
INSERT INTO profesionales (id, usuario_id, sucursal_id, especialidad)
SELECT 'cccccccc-cccc-cccc-cccc-cccccccccccc', id, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Barbero Master / Estilista'
FROM auth.users WHERE email = 'admin@optiturno.com'
ON CONFLICT DO NOTHING;

INSERT INTO profesionales (id, usuario_id, sucursal_id, especialidad)
SELECT 'dddddddd-dddd-dddd-dddd-dddddddddddd', id, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Barbero'
FROM auth.users WHERE email = 'empleado@optiturno.com'
ON CONFLICT DO NOTHING;

-- 5.5 Horarios: lunes a viernes 08:00-18:00 para ambos profesionales
INSERT INTO horarios_laborales (profesional_id, dia_semana, hora_inicio, hora_fin)
SELECT p.id, d, '08:00:00', '18:00:00'
FROM profesionales p
CROSS JOIN generate_series(1, 5) AS d
WHERE p.id IN ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'dddddddd-dddd-dddd-dddd-dddddddddddd')
ON CONFLICT DO NOTHING;

-- ==============================
-- 6. VERIFICACIÓN
-- ==============================
SELECT 'usuarios (auth)' AS tabla, count(*) FROM auth.users
  WHERE email LIKE '%@optiturno.com'
UNION ALL SELECT 'usuarios (espejo)', count(*) FROM usuarios
UNION ALL SELECT 'negocios', count(*) FROM negocios
UNION ALL SELECT 'sucursales', count(*) FROM sucursales
UNION ALL SELECT 'servicios', count(*) FROM servicios
UNION ALL SELECT 'profesionales', count(*) FROM profesionales
UNION ALL SELECT 'horarios_laborales', count(*) FROM horarios_laborales
UNION ALL SELECT 'profesional_ausencias', count(*) FROM profesional_ausencias
ORDER BY tabla;