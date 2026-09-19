-- ============================================================
-- Migración 00006: Agregar 'pendiente_pago' al CHECK de turnos
-- ============================================================
-- La migración 00005 (v1) recreó el CHECK sin 'pendiente_pago'.
-- Esta es la corrección para bases ya migradas con esa versión.

-- 1. Eliminar la restricción anterior
ALTER TABLE public.turnos
DROP CONSTRAINT IF EXISTS turnos_estado_check;

-- 2. Recrear el CHECK con todos los estados válidos
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