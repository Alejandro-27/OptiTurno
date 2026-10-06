-- ============================================================
-- Migración 0012: Tabla intermedia profesional_sucursales (N:M)
-- ============================================================
-- Permite que un profesional/empleado trabaje en múltiples sedes.
-- Campo `activo` para soft-delete (desvincular sin borrar historial).
-- Campo `es_principal` para identificar la sede principal del profesional.

-- 1. Crear tabla intermedia
CREATE TABLE IF NOT EXISTS public.profesional_sucursales (
  profesional_id UUID NOT NULL REFERENCES public.profesionales(id) ON DELETE CASCADE,
  sucursal_id    UUID NOT NULL REFERENCES public.sucursales(id) ON DELETE CASCADE,
  es_principal   BOOLEAN NOT NULL DEFAULT false,
  activo         BOOLEAN NOT NULL DEFAULT true,
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (profesional_id, sucursal_id)
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_profesional_sucursales_sucursal
  ON public.profesional_sucursales (sucursal_id) WHERE activo = true;
CREATE INDEX IF NOT EXISTS idx_profesional_sucursales_profesional
  ON public.profesional_sucursales (profesional_id) WHERE activo = true;

-- Trigger para actualizado_en
CREATE OR REPLACE FUNCTION public.touch_profesional_sucursales_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profesional_sucursales_updated_at ON public.profesional_sucursales;
CREATE TRIGGER profesional_sucursales_updated_at
  BEFORE UPDATE ON public.profesional_sucursales
  FOR EACH ROW EXECUTE FUNCTION public.touch_profesional_sucursales_updated_at();

-- 2. Migrar datos existentes: cada profesional tenía 1 sucursal_id en la tabla profesionales
-- Insertar filas en la nueva tabla basándose en el sucursal_id actual
INSERT INTO public.profesional_sucursales (profesional_id, sucursal_id, es_principal, activo, creado_en)
SELECT
  p.id,
  p.sucursal_id,
  true,          -- la sede actual se marca como principal
  true,
  now()          -- profesionales no tiene created_at, usamos now()
FROM public.profesionales p
WHERE p.sucursal_id IS NOT NULL
ON CONFLICT (profesional_id, sucursal_id) DO NOTHING;

-- 3. Constraint: cada profesional debe tener al menos una sede principal activa
-- (No se puede borrar la última fila con es_principal=true y activo=true)
-- Se valida a nivel de aplicación; a nivel BD se deja flexible para transiciones.

-- 4. RLS: habilitar y política dev (service_role bypasa)
ALTER TABLE public.profesional_sucursales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dev_allow_all" ON public.profesional_sucursales
  FOR ALL USING (true);

-- 5. Comentarios
COMMENT ON TABLE public.profesional_sucursales IS
  'Relación N:M entre profesionales y sedes. Permite multi-sede y soft-delete via activo=false.';
COMMENT ON COLUMN public.profesional_sucursales.es_principal IS
  'Indica la sede principal del profesional (para horarios, reportes, etc.).';
COMMENT ON COLUMN public.profesional_sucursales.activo IS
  'Soft-delete: false = desvinculado sin borrar historial de turnos.';