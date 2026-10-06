-- ============================================================
-- Migración 0013: sucursal_id en usuarios para admin_negocio
-- ============================================================
-- Añade sucursal_id a la tabla usuarios para vincular admin_negocio
-- a su sede asignada (aislamiento estricto).
-- Índice único parcial: una admin_negocio por sede.

-- 1. Añadir columna sucursal_id (nullable, solo para admin_negocio y empleado)
ALTER TABLE IF EXISTS public.usuarios
  ADD COLUMN IF NOT EXISTS sucursal_id UUID REFERENCES public.sucursales(id) ON DELETE SET NULL;

-- 2. Índice único parcial: una admin_negocio por sede
CREATE UNIQUE INDEX IF NOT EXISTS uniq_admin_negocio_por_sucursal
  ON public.usuarios (sucursal_id)
  WHERE rol = 'admin_negocio';

-- Índice para consultas por sucursal
CREATE INDEX IF NOT EXISTS idx_usuarios_sucursal_id
  ON public.usuarios (sucursal_id) WHERE sucursal_id IS NOT NULL;

-- 3. Migrar datos existentes: vincular admin_negocio de prueba a su sucursal
-- El usuario 11111111-... (Andrés Barbero Master) está en sucursal bbbbbbbb-...
UPDATE public.usuarios
SET sucursal_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
WHERE id = '11111111-1111-1111-1111-111111111111'
  AND rol = 'admin_negocio'
  AND sucursal_id IS NULL;

-- 4. RLS: la tabla usuarios ya tiene RLS habilitado
-- La política dev_allow_all ya existe desde 00001

-- 5. Comentarios
COMMENT ON COLUMN public.usuarios.sucursal_id IS
  'Sede asignada al admin_negocio o empleado. Para admin_negocio: única sede que gestiona (índice único parcial). Para empleado: sede principal (puede tener más via profesional_sucursales). NULL para superadmin y cliente.';