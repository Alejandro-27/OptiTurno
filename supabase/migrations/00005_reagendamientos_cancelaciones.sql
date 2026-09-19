-- ============================================================
-- Migración 00005: Reagendamientos y Cancelaciones
-- ============================================================

-- 1. Eliminar restricción GIST anterior (incluye todos los estados)
ALTER TABLE public.turnos
DROP CONSTRAINT IF EXISTS no_solapar_turnos;

-- 2. Actualizar CHECK de estados
ALTER TABLE public.turnos
DROP CONSTRAINT IF EXISTS turnos_estado_check;

ALTER TABLE public.turnos
ADD CONSTRAINT turnos_estado_check
CHECK (estado IN (
  'pendiente_pago',
  'confirmado',
  'cancelado',
  'reagendado',
  'pendiente_reagendamiento',
  'completado',
  'no_asistio'
));

-- 3. Columnas de trazabilidad para cancelaciones
ALTER TABLE public.turnos
ADD COLUMN IF NOT EXISTS motivo_cancelacion TEXT,
ADD COLUMN IF NOT EXISTS cancelado_por TEXT
  CHECK (cancelado_por IN ('cliente', 'comercio', 'sistema'));

-- 4. Recrear GIST excluyendo cancelados y reagendados
--    (libera el slot para reagendamiento y nuevas reservas)
ALTER TABLE public.turnos
ADD CONSTRAINT no_solapar_turnos
EXCLUDE USING gist (
  profesional_id WITH =,
  (tsrange(
    (fecha + hora_inicio)::timestamp,
    (fecha + hora_fin)::timestamp,
    '[)'
  )) WITH &&
)
WHERE (estado NOT IN ('cancelado', 'reagendado'));

-- 5. Índice para turnos pendientes de reagendamiento
CREATE INDEX IF NOT EXISTS idx_turnos_pendiente_reagendamiento
ON public.turnos (profesional_id, fecha)
WHERE estado = 'pendiente_reagendamiento';
