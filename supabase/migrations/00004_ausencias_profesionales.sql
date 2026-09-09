-- ============================================================
-- OptiTurno — Migración 00004: Ausencias de profesionales
-- ------------------------------------------------------------
-- Ausencias puntuales (día libre, franjas del mismo día, vacaciones).
-- Si hora_inicio/hora_fin son NULL la ausencia es por todo el día.
-- El control de acceso lo hace el backend vía service_role key.
-- ============================================================

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

-- Evita duplicar una ausencia de día completo del mismo profesional en la misma fecha
CREATE UNIQUE INDEX IF NOT EXISTS uq_ausencia_dia_completo
  ON profesional_ausencias (profesional_id, fecha)
  WHERE hora_inicio IS NULL;

-- -----------------------------------------------------------
-- Los profesionales vinculados a una sucursal pasan a rol 'empleado'
-- (vista restringida del panel: disponibilidad + ausencias propias).
-- -----------------------------------------------------------
UPDATE usuarios
SET rol = 'empleado'
WHERE rol = 'cliente'
  AND id IN (SELECT usuario_id FROM profesionales);

-- -----------------------------------------------------------
-- RLS (habilitado, permisivo como el resto del schema local)
-- -----------------------------------------------------------
ALTER TABLE profesional_ausencias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dev_allow_all" ON profesional_ausencias FOR ALL USING (true);