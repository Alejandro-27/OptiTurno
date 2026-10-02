-- Consentimiento RGPD para el tratamiento de datos personales.
-- La app NO crea cuentas ni reservas sin aceptación explícita del titular:
-- - usuarios.acepto_terminos    -> registro público
-- - usuarios.acepto_privacidad  -> registro público
-- - turnos.consentimiento_hecho -> cada reserva (queda constancia provable)

ALTER TABLE public.usuarios
  ADD COLUMN IF NOT EXISTS acepto_terminos boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS acepto_privacidad boolean NOT NULL DEFAULT false;

ALTER TABLE public.turnos
  ADD COLUMN IF NOT EXISTS consentimiento_hecho boolean NOT NULL DEFAULT false;