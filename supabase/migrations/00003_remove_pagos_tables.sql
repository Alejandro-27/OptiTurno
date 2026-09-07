-- ============================================================
-- OptiTurno — Migración 00003: eliminar el dominio de pagos
-- La integración de Stripe se movió a la rama feat/experimental.
-- Las reservas se confirman directamente, sin depósito previo.
-- ============================================================

-- Tablas de pagos que dependían de Stripe (ver migración 00001)
DROP TABLE IF EXISTS pagos_garantia CASCADE;
DROP TABLE IF EXISTS intenciones_de_pago CASCADE;

-- Los turnos ya no nace en 'pendiente_pago': se confirman al reservar
ALTER TABLE turnos
  ALTER COLUMN estado SET DEFAULT 'confirmado';