-- ============================================================
-- Migración 00008: Endurecer RLS para producción
-- ============================================================
-- Elimina las policies permisivas 'dev_allow_all' (creadas por 00001 y por
-- setup_produccion.sql) y revoca todo privilegio a anon/authenticated.
-- El backend accede con service_role, que bypasa RLS: esta es la config
-- segura para cualquier entorno (local, preview y producción).

-- 1. Eliminar policies permisivas (idempotente)
DROP POLICY IF EXISTS "dev_allow_all" ON usuarios;
DROP POLICY IF EXISTS "dev_allow_all" ON negocios;
DROP POLICY IF EXISTS "dev_allow_all" ON sucursales;
DROP POLICY IF EXISTS "dev_allow_all" ON servicios;
DROP POLICY IF EXISTS "dev_allow_all" ON profesionales;
DROP POLICY IF EXISTS "dev_allow_all" ON horarios_laborales;
DROP POLICY IF EXISTS "dev_allow_all" ON turnos;
DROP POLICY IF EXISTS "dev_allow_all" ON profesional_ausencias;
DROP POLICY IF EXISTS "dev_allow_all" ON pagos_garantia;
DROP POLICY IF EXISTS "dev_allow_all" ON intenciones_de_pago;

-- 2. Revocar privilegios a los roles de menor privilegio (anon/authenticated)
REVOKE ALL ON usuarios, negocios, sucursales, servicios, profesionales,
  horarios_laborales, turnos, profesional_ausencias, pagos_garantia,
  intenciones_de_pago FROM anon, authenticated;