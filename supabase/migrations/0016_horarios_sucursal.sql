-- ============================================================
-- Migración 0016: Añadir sucursal_id a horarios_laborales
-- ============================================================
-- Un profesional puede tener horarios distintos por sede.
-- Clave única compuesta: (profesional_id, sucursal_id, dia_semana)

-- 1. Añadir columna sucursal_id
ALTER TABLE IF EXISTS public.horarios_laborales
  ADD COLUMN IF NOT EXISTS sucursal_id UUID REFERENCES public.sucursales(id) ON DELETE CASCADE;

-- 2. Migrar datos existentes: asumir que horarios existentes pertenecen
-- a la sede principal del profesional (via profesional_sucursales.es_principal)
UPDATE public.horarios_laborales hl
SET sucursal_id = ps.sucursal_id
FROM public.profesional_sucursales ps
WHERE hl.profesional_id = ps.profesional_id
  AND ps.es_principal = true
  AND hl.sucursal_id IS NULL;

-- 3. Hacer NOT NULL para nuevos registros
ALTER TABLE public.horarios_laborales
  ALTER COLUMN sucursal_id SET NOT NULL;

-- 4. Índice único: un horario por profesional + sede + día
DROP INDEX IF EXISTS horarios_laborales_profesional_id_dia_semana_key;
CREATE UNIQUE INDEX IF NOT EXISTS uniq_horario_prof_sucursal_dia
  ON public.horarios_laborales (profesional_id, sucursal_id, dia_semana);

-- 5. Índices para consultas
CREATE INDEX IF NOT EXISTS idx_horarios_sucursal ON public.horarios_laborales (sucursal_id);
CREATE INDEX IF NOT EXISTS idx_horarios_profesional ON public.horarios_laborales (profesional_id);

-- 6. RLS
ALTER TABLE public.horarios_laborales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dev_allow_all" ON public.horarios_laborales FOR ALL USING (true);

-- 7. Comentario
COMMENT ON COLUMN public.horarios_laborales.sucursal_id IS
  'Sede donde aplica este horario. Un profesional puede tener horarios distintos por sede.';