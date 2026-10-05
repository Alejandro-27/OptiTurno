-- ============================================================
-- Migración 00008: Endurecer RLS para producción
-- ============================================================
-- Elimina las policies permisivas 'dev_allow_all' (creadas por 00001 y por
-- setup_produccion.sql) y revoca todo privilegio a anon/authenticated.
-- El backend accede con service_role, que bypasa RLS: esta es la config
-- segura para cualquier entorno (local, preview y producción).
--
-- Nota: `pagos_garantia` e `intenciones_de_pago` se eliminan en 00003, así que
-- aquí solo se tocan si todavía existen (un reset limpio las crearía igual).

-- 1. Eliminar policies permisivas (idempotente y tolerante a tablas ausentes)
DO $$
DECLARE
  tabla TEXT;
  tablas TEXT[] := ARRAY[
    'usuarios', 'negocios', 'sucursales', 'servicios', 'profesionales',
    'horarios_laborales', 'turnos', 'profesional_ausencias',
    'pagos_garantia', 'intenciones_de_pago'
  ];
BEGIN
  FOREACH tabla IN ARRAY tablas LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = tabla) THEN
      EXECUTE format('DROP POLICY IF EXISTS "dev_allow_all" ON public.%I', tabla);
    END IF;
  END LOOP;
END $$;

-- 2. Revocar privilegios a los roles de menor privilegio (anon/authenticated)
REVOKE ALL ON usuarios, negocios, sucursales, servicios, profesionales,
  horarios_laborales, turnos, profesional_ausencias FROM anon, authenticated;

DO $$
DECLARE
  tabla TEXT;
  tablas TEXT[] := ARRAY['pagos_garantia', 'intenciones_de_pago'];
BEGIN
  FOREACH tabla IN ARRAY tablas LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = tabla) THEN
      EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated', tabla);
    END IF;
  END LOOP;
END $$;