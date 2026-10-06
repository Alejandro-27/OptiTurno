-- ============================================================
-- Migración 0014: activo + timestamps en negocios y sucursales
-- ============================================================
-- Soft-delete para preservar historial de turnos y métricas.
-- Timestamps para auditoría y ordenación.

-- 1. Negocios: activo + created_at + updated_at
ALTER TABLE IF EXISTS public.negocios
  ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Actualizar created_at de negocios existentes (usar now() como fallback)
UPDATE public.negocios
SET created_at = now(), updated_at = now()
WHERE created_at IS NULL OR updated_at IS NULL;

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.touch_negocios_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS negocios_updated_at ON public.negocios;
CREATE TRIGGER negocios_updated_at
  BEFORE UPDATE ON public.negocios
  FOR EACH ROW EXECUTE FUNCTION public.touch_negocios_updated_at();

-- 2. Sucursales: activo + created_at + updated_at
ALTER TABLE IF EXISTS public.sucursales
  ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

UPDATE public.sucursales
SET created_at = now(), updated_at = now()
WHERE created_at IS NULL OR updated_at IS NULL;

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.touch_sucursales_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sucursales_updated_at ON public.sucursales;
CREATE TRIGGER sucursales_updated_at
  BEFORE UPDATE ON public.sucursales
  FOR EACH ROW EXECUTE FUNCTION public.touch_sucursales_updated_at();

-- 3. Índices para consultas activas
CREATE INDEX IF NOT EXISTS idx_negocios_activo ON public.negocios (activo);
CREATE INDEX IF NOT EXISTS idx_sucursales_activo ON public.sucursales (activo);
CREATE INDEX IF NOT EXISTS idx_sucursales_negocio_activo
  ON public.sucursales (negocio_id) WHERE activo = true;

-- 4. RLS: ya habilitado desde 00001 (dev_allow_all)

-- 5. Comentarios
COMMENT ON COLUMN public.negocios.activo IS
  'Soft-delete: false = negocio desactivado (preserva historial de turnos, métricas, sedes).';
COMMENT ON COLUMN public.sucursales.activo IS
  'Soft-delete: false = sede desactivada (preserva historial de turnos, profesionales, métricas).';