-- ============================================================
-- Migración 0017: Permitir SELECT en turnos para Supabase Realtime
-- ============================================================
-- La migración 00008 revocó todo permiso sobre turnos a anon y authenticated.
-- Para que el cliente frontend (RealtimeSync) reciba eventos via postgres_changes,
-- los roles anon y authenticated necesitan permiso de lectura (SELECT).
-- Las mutaciones (INSERT, UPDATE, DELETE) siguen restringidas exclusivamente al backend (service_role).

GRANT SELECT ON public.turnos TO anon, authenticated;

-- Política de lectura para Realtime
DROP POLICY IF EXISTS "realtime_turnos_select" ON public.turnos;
CREATE POLICY "realtime_turnos_select" ON public.turnos
  FOR SELECT
  TO anon, authenticated
  USING (true);
