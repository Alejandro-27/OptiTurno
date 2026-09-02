-- ============================================================
-- OptiTurno — Migración inicial: schema completo
-- Ejecutada automáticamente por `supabase db reset` o `supabase start`
-- ============================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- -----------------------------------------------------------
-- 1. USUARIOS (espejo de auth.users, con rol propio)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre     TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE,
  telefono   TEXT,
  rol        TEXT NOT NULL DEFAULT 'cliente'
);

-- -----------------------------------------------------------
-- 2. NEGOCIOS
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS negocios (
  id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  slug   TEXT NOT NULL UNIQUE
);

-- -----------------------------------------------------------
-- 3. SUCURSALES
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS sucursales (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  negocio_id  UUID NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
  nombre      TEXT NOT NULL,
  direccion   TEXT NOT NULL,
  telefono    TEXT NOT NULL
);

-- -----------------------------------------------------------
-- 4. SERVICIOS
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS servicios (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sucursal_id       UUID NOT NULL REFERENCES sucursales(id) ON DELETE CASCADE,
  nombre            TEXT NOT NULL,
  descripcion       TEXT,
  precio            NUMERIC(10,2) NOT NULL,
  duracion_minutos  INTEGER NOT NULL CHECK (duracion_minutos > 0)
);

-- -----------------------------------------------------------
-- 5. PROFESIONALES
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS profesionales (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id  UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  sucursal_id UUID NOT NULL REFERENCES sucursales(id) ON DELETE CASCADE,
  especialidad TEXT
);

-- -----------------------------------------------------------
-- 6. HORARIOS LABORALES
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS horarios_laborales (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profesional_id UUID NOT NULL REFERENCES profesionales(id) ON DELETE CASCADE,
  dia_semana     INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  hora_inicio    TIME NOT NULL,
  hora_fin       TIME NOT NULL CHECK (hora_fin > hora_inicio)
);

-- -----------------------------------------------------------
-- 7. TURNOS (con constraint GIST de exclusión)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS turnos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id      UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  profesional_id  UUID NOT NULL REFERENCES profesionales(id) ON DELETE CASCADE,
  servicio_id     UUID NOT NULL REFERENCES servicios(id) ON DELETE CASCADE,
  fecha           DATE NOT NULL,
  hora_inicio     TIME NOT NULL,
  hora_fin        TIME NOT NULL CHECK (hora_fin > hora_inicio),
  estado          TEXT NOT NULL DEFAULT 'pendiente_pago',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Constraint GIST: evita doble reserva del mismo profesional en el mismo rango
--期刊: usa tsrange sobre fecha + hora para la comparación
ALTER TABLE turnos ADD CONSTRAINT no_solapar_turnos
  EXCLUDE USING gist (
    profesional_id WITH =,
    (tsrange(
      (fecha + hora_inicio)::timestamp,
      (fecha + hora_fin)::timestamp,
      '[)'
    )) WITH &&
  );

-- -----------------------------------------------------------
-- 8. PAGOS DE GARANTÍA
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS pagos_garantia (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turno_id        UUID NOT NULL REFERENCES turnos(id) ON DELETE CASCADE,
  pasarela        TEXT NOT NULL DEFAULT 'stripe',
  transaccion_id  TEXT NOT NULL,
  monto           NUMERIC(10,2) NOT NULL,
  estado          TEXT NOT NULL DEFAULT 'pendiente',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ
);

-- -----------------------------------------------------------
-- 9. INTENCIONES DE PAGO (referenciado en AGENTS.md, no usado aún)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS intenciones_de_pago (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turno_id        UUID NOT NULL REFERENCES turnos(id) ON DELETE CASCADE,
  monto           NUMERIC(10,2) NOT NULL,
  estado          TEXT NOT NULL DEFAULT 'pendiente',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------
-- RLS (Row Level Security)
-- Habilitado pero SIN políticas restrictivas por ahora.
-- El control de acceso lo hace el backend vía service_role key.
-- -----------------------------------------------------------
ALTER TABLE usuarios             ENABLE ROW LEVEL SECURITY;
ALTER TABLE negocios             ENABLE ROW LEVEL SECURITY;
ALTER TABLE sucursales           ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios            ENABLE ROW LEVEL SECURITY;
ALTER TABLE profesionales        ENABLE ROW LEVEL SECURITY;
ALTER TABLE horarios_laborales   ENABLE ROW LEVEL SECURITY;
ALTER TABLE turnos               ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos_garantia       ENABLE ROW LEVEL SECURITY;
ALTER TABLE intenciones_de_pago  ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas para desarrollo local (service_role bypasa RLS automáticamente)
CREATE POLICY "dev_allow_all" ON usuarios             FOR ALL USING (true);
CREATE POLICY "dev_allow_all" ON negocios             FOR ALL USING (true);
CREATE POLICY "dev_allow_all" ON sucursales           FOR ALL USING (true);
CREATE POLICY "dev_allow_all" ON servicios            FOR ALL USING (true);
CREATE POLICY "dev_allow_all" ON profesionales        FOR ALL USING (true);
CREATE POLICY "dev_allow_all" ON horarios_laborales   FOR ALL USING (true);
CREATE POLICY "dev_allow_all" ON turnos               FOR ALL USING (true);
CREATE POLICY "dev_allow_all" ON pagos_garantia       FOR ALL USING (true);
CREATE POLICY "dev_allow_all" ON intenciones_de_pago  FOR ALL USING (true);
