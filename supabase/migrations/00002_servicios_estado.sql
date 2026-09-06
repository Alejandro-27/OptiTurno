-- ============================================================
-- OptiTurno — Migración 00002
-- Agrega el estado Activo/Pausado al catálogo de servicios.
-- El panel admin (Catálogo) puede pausar/activar servicios.
-- ============================================================
ALTER TABLE servicios
  ADD COLUMN IF NOT EXISTS estado TEXT NOT NULL DEFAULT 'Activo'
  CHECK (estado IN ('Activo', 'Pausado'));