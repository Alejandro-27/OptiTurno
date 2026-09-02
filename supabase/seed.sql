-- ============================================================
-- OptiTurno — Seed de datos demo
-- Ejecutado después de las migraciones en `supabase db reset`
-- ============================================================

-- 1. Usuarios de prueba
-- UUIDs fijos para que el frontend (modo demo) los referencie de forma estable
INSERT INTO usuarios (id, nombre, email, telefono, rol) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Andrés Barbero Master', 'andres.master@optiturno.com', '3159999999', 'admin_negocio'),
  ('22222222-2222-2222-2222-222222222222', 'Alejandro Cliente Prueba', 'alejandro.test@gmail.com', '3102222222', 'cliente')
ON CONFLICT (id) DO NOTHING;

-- 2. Negocio demo
INSERT INTO negocios (id, nombre, slug) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Barbería El Elegante', 'barberia-el-elegante')
ON CONFLICT (slug) DO NOTHING;

-- 3. Sucursal demo
INSERT INTO sucursales (id, negocio_id, nombre, direccion, telefono) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Sede Central Anapoima', 'Calle 4 #5-12', '3101234567')
ON CONFLICT DO NOTHING;

-- 4. Servicios demo
INSERT INTO servicios (sucursal_id, nombre, descripcion, precio, duracion_minutos) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Corte de Cabello Premium', 'Incluye lavado y perfilado de cejas', 25000, 30),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Barba Esculpida y Toalla Caliente', 'Ritual tradicional con navaja', 18000, 30),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Combo Rey (Corte + Barba)', 'El servicio completo de la casa', 38000, 60);

-- 5. Profesional demo (vinculado al usuario 11111111...)
INSERT INTO profesionales (id, usuario_id, sucursal_id, especialidad) VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Barbero Master / Estilista')
ON CONFLICT DO NOTHING;

-- 6. Horarios laborales: lunes a viernes 08:00 - 18:00
INSERT INTO horarios_laborales (profesional_id, dia_semana, hora_inicio, hora_fin) VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 1, '08:00:00', '18:00:00'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 2, '08:00:00', '18:00:00'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 3, '08:00:00', '18:00:00'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 4, '08:00:00', '18:00:00'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 5, '08:00:00', '18:00:00');
