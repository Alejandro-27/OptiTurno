-- Registro de notificaciones salientes (recordatorios de WhatsApp).
-- Idempotencia: UNIQUE(turno_id, ventana_horas) impide enviar dos veces el
-- mismo recordatorio de la misma ventana, incluso si el cron corre en paralelo.
-- Estados: pendiente (claimed) -> enviado | fallido (reintentable hasta 3 veces).
-- La tabla la escribe el backend con service_role; RLS cerrada por defecto.

CREATE TABLE IF NOT EXISTS public.notificaciones (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turno_id      UUID NOT NULL REFERENCES public.turnos(id) ON DELETE CASCADE,
  ventana_horas INTEGER NOT NULL DEFAULT 24 CHECK (ventana_horas BETWEEN 1 AND 168),
  estado        TEXT NOT NULL DEFAULT 'pendiente'
                CHECK (estado IN ('pendiente', 'enviado', 'fallido')),
  canal         TEXT NOT NULL DEFAULT 'whatsapp' CHECK (canal IN ('whatsapp')),
  intentos      INTEGER NOT NULL DEFAULT 0 CHECK (intentos >= 0),
  destinatario  TEXT,
  mensaje       TEXT,
  error         TEXT,
  enviado_en    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT notificaciones_turno_ventana_unico UNIQUE (turno_id, ventana_horas)
);

-- El cron consulta por fecha de turno y estado; el índice evita escanear todo.
CREATE INDEX IF NOT EXISTS notificaciones_turno_fecha_idx
  ON public.notificaciones (ventana_horas, estado);

CREATE OR REPLACE FUNCTION public.touch_notificaciones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notificaciones_updated_at ON public.notificaciones;
CREATE TRIGGER notificaciones_updated_at
  BEFORE UPDATE ON public.notificaciones
  FOR EACH ROW EXECUTE FUNCTION public.touch_notificaciones_updated_at();

-- RLS: la tabla solo se usa desde el backend (service_role); anon/authenticated
-- quedan sin acceso, igual que el resto del hardening (ver 00008).
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.notificaciones FROM anon, authenticated;