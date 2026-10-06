-- ============================================================
-- Migración 0015: Hacer sucursal_id nullable en profesionales
-- ============================================================
-- Con la tabla intermedia profesional_sucursales, el sucursal_id
-- directo en profesionales ya no es obligatorio (puede tener 0, 1 o N sedes).
-- Se mantiene para compatibilidad/historial pero se hace nullable.

ALTER TABLE public.profesionales
  ALTER COLUMN sucursal_id DROP NOT NULL;

-- Comentario
COMMENT ON COLUMN public.profesionales.sucursal_id IS
  'Legacy: sede principal del profesional (mantenido por compatibilidad).
   La relación real multi-sede está en profesional_sucursales.';