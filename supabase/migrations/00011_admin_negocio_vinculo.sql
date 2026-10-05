-- ============================================================
-- Migración 00011: Vincular negocio con admin_negocio (dueño)
-- ============================================================
-- Permite resolver el negocio de un usuario admin_negocio consultando
--   SELECT * FROM negocios WHERE admin_usuario_id = $uid;
-- Evita duplicar FK en usuarios y mantiene el modelo simple.

-- 1. Columna en negocios (nullable para no romper seed existente)
ALTER TABLE IF EXISTS public.negocios
  ADD COLUMN IF NOT EXISTS admin_usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL;

-- Índice para lookup rápido
CREATE INDEX IF NOT EXISTS idx_negocios_admin_usuario
  ON public.negocios (admin_usuario_id);

-- 2. Seed: asociar el negocio de prueba al usuario admin@optiturno.com (superadmin en seed, pero tratamos como admin_negocio de prueba)
-- El seeder crea el negocio con slug 'barberia-el-elegante' y el usuario 11111111-... (Andrés Barbero Master).
-- Hacemos el vínculo idempotente.
DO $$
DECLARE
  v_negocio_id UUID;
  v_admin_id   UUID := '11111111-1111-1111-1111-111111111111';
BEGIN
  SELECT id INTO v_negocio_id
  FROM public.negocios
  WHERE slug = 'barberia-el-elegante'
  LIMIT 1;

  IF v_negocio_id IS NOT NULL THEN
    UPDATE public.negocios
    SET admin_usuario_id = v_admin_id
    WHERE id = v_negocio_id
      AND (admin_usuario_id IS NULL OR admin_usuario_id <> v_admin_id);
  END IF;
END $$;

-- 3. Notas:
-- - Los usuarios 'cliente' NO se atan a negocio (respuesta #2).
-- - Los 'empleado' se vinculan vía profesionales.sucursal_id -> sucursales.negocio_id (ya existe).
-- - RLS se endurecerá en issue dedicada (respuesta #5).