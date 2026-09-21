-- Migración 00007: habilitar Supabase Realtime (Postgres Changes) en turnos
-- Habilita la tabla en la publicación supabase_realtime de forma idempotente
-- y usa REPLICA IDENTITY FULL para que los eventos UPDATE/DELETE incluyan la
-- fila completa (necesario para refrescar la vista de forma correcta).

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'turnos'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.turnos;
  END IF;
END
$$;

ALTER TABLE public.turnos REPLICA IDENTITY FULL;