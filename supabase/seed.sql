-- ============================================================
-- OptiTurno — Seed de datos de prueba (Multi-tenant)
-- Ejecutado después de las migraciones en `supabase db reset`
-- ============================================================

-- ============================================================
-- 1. SUPERADMIN DE PLATAFORMA (dueño global)
-- ============================================================
INSERT INTO usuarios (id, nombre, email, telefono, rol, sucursal_id) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Super Admin Plataforma', 'superadmin@optiturno.com', '3000000001', 'superadmin', NULL)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. NEGOCIOS Y SEDES DE PRUEBA
-- ============================================================

-- Negocio 1: Barbería El Elegante (dueño: superadmin)
INSERT INTO negocios (id, nombre, slug, admin_usuario_id, activo, created_at, updated_at) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Barbería El Elegante', 'barberia-el-elegante', '00000000-0000-0000-0000-000000000001', true, now(), now())
ON CONFLICT (slug) DO NOTHING;

-- Sucursales del Negocio 1
INSERT INTO sucursales (id, negocio_id, nombre, direccion, telefono, activo, created_at, updated_at) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Sede Central Anapoima', 'Calle 4 #5-12', '3101234567', true, now(), now()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Sede Norte Bogotá', 'Av 19 #100-20', '3101234568', true, now(), now()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Sede Sur Medellín', 'Cra 43A #30-15', '3101234569', true, now(), now())
ON CONFLICT DO NOTHING;

-- Admin de sede para Sede Central Anapoima
INSERT INTO usuarios (id, nombre, email, telefono, rol, sucursal_id) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Andrés Barbero Master', 'andres.master@optiturno.com', '3159999999', 'admin_negocio', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')
ON CONFLICT (id) DO NOTHING;

-- Admin de sede para Sede Norte Bogotá
INSERT INTO usuarios (id, nombre, email, telefono, rol, sucursal_id) VALUES
  ('11111111-1111-1111-1111-111111111112', 'Carlos Administrador Norte', 'carlos.norte@optiturno.com', '3159999992', 'admin_negocio', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc')
ON CONFLICT (id) DO NOTHING;

-- Admin de sede para Sede Sur Medellín
INSERT INTO usuarios (id, nombre, email, telefono, rol, sucursal_id) VALUES
  ('11111111-1111-1111-1111-111111111113', 'María Administradora Sur', 'maria.sur@optiturno.com', '3159999993', 'admin_negocio', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbd')
ON CONFLICT (id) DO NOTHING;

-- Negocio 2: Spa Relax (otro comercio independiente)
INSERT INTO negocios (id, nombre, slug, admin_usuario_id, activo, created_at, updated_at) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'Spa Relax & Wellness', 'spa-relax', '00000000-0000-0000-0000-000000000001', true, now(), now())
ON CONFLICT (slug) DO NOTHING;

INSERT INTO sucursales (id, negocio_id, nombre, direccion, telefono, activo, created_at, updated_at) VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'Sede Principal Chapinero', 'Calle 57 #7-32', '3102222222', true, now(), now())
ON CONFLICT DO NOTHING;

INSERT INTO usuarios (id, nombre, email, telefono, rol, sucursal_id) VALUES
  ('11111111-1111-1111-1111-111111111114', 'Laura Spa Manager', 'laura.spa@optiturno.com', '3158888888', 'admin_negocio', 'cccccccc-cccc-cccc-cccc-cccccccccccc')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. CLIENTE DE PRUEBA (global, no atado a negocio)
-- ============================================================
INSERT INTO usuarios (id, nombre, email, telefono, rol, sucursal_id) VALUES
  ('22222222-2222-2222-2222-222222222222', 'Alejandro Cliente Prueba', 'alejandro.test@gmail.com', '3102222222', 'cliente', NULL)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4. SERVICIOS POR SEDE
-- ============================================================

-- Servicios Sede Central Anapoima (bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb)
INSERT INTO servicios (sucursal_id, nombre, descripcion, precio, duracion_minutos) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Corte de Cabello Premium', 'Incluye lavado y perfilado de cejas', 25000, 30),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Barba Esculpida y Toalla Caliente', 'Ritual tradicional con navaja', 18000, 30),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Combo Rey (Corte + Barba)', 'El servicio completo de la casa', 38000, 60)
ON CONFLICT DO NOTHING;

-- Servicios Sede Norte Bogotá
INSERT INTO servicios (sucursal_id, nombre, descripcion, precio, duracion_minutos) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc', 'Corte Caballero', 'Corte clásico con máquina y tijera', 20000, 30),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc', 'Barba Express', 'Perfilado rápido de barba', 12000, 15)
ON CONFLICT DO NOTHING;

-- Servicios Sede Sur Medellín
INSERT INTO servicios (sucursal_id, nombre, descripcion, precio, duracion_minutos) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbd', 'Corte Femenino', 'Corte con lavado y peinado', 30000, 45),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbd', 'Tinte Raíces', 'Coloración profesional', 45000, 60)
ON CONFLICT DO NOTHING;

-- Servicios Spa Relax
INSERT INTO servicios (sucursal_id, nombre, descripcion, precio, duracion_minutos) VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Masaje Relajante 60 min', 'Masaje sueco con aceites esenciales', 80000, 60),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Facial Profundo', 'Limpieza + hidratación + mascarilla', 65000, 50)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 5. PROFESIONALES Y VINCULACIÓN MULTI-SEDE (profesional_sucursales)
-- ============================================================

-- Profesional 1: Andrés Barbero (dueño + barbero) - Sede Central Anapoima (principal) + Sede Norte
INSERT INTO profesionales (id, usuario_id, especialidad) VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Barbero Master / Estilista')
ON CONFLICT DO NOTHING;

INSERT INTO profesional_sucursales (profesional_id, sucursal_id, es_principal, activo, creado_en) VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', true, true, now()),   -- Principal: Anapoima
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc', false, true, now())  -- También atiende en Norte
ON CONFLICT DO NOTHING;

-- Profesional 2: Carlos Barbero - Solo Sede Norte
INSERT INTO profesionales (id, usuario_id, especialidad) VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccd', '11111111-1111-1111-1111-111111111112', 'Barbero Clásico')
ON CONFLICT DO NOTHING;

INSERT INTO profesional_sucursales (profesional_id, sucursal_id, es_principal, activo, creado_en) VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccd', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc', true, true, now())
ON CONFLICT DO NOTHING;

-- Profesional 3: María Estilista - Sede Sur Medellín (principal) + Spa Relax (multi-negocio)
INSERT INTO profesionales (id, usuario_id, especialidad) VALUES
  ('cccccccc-cccc-cccc-cccc-ccccccccccce', '11111111-1111-1111-1111-111111111113', 'Estilista Colorista')
ON CONFLICT DO NOTHING;

INSERT INTO profesional_sucursales (profesional_id, sucursal_id, es_principal, activo, creado_en) VALUES
  ('cccccccc-cccc-cccc-cccc-ccccccccccce', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbd', true, true, now()),    -- Principal: Sur
  ('cccccccc-cccc-cccc-cccc-ccccccccccce', 'cccccccc-cccc-cccc-cccc-cccccccccccc', false, true, now())  -- También atiende en Spa
ON CONFLICT DO NOTHING;

-- Profesional 4: Laura Masajista - Spa Relax
INSERT INTO profesionales (id, usuario_id, especialidad) VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccf', '11111111-1111-1111-1111-111111111114', 'Masajista Certificada')
ON CONFLICT DO NOTHING;

INSERT INTO profesional_sucursales (profesional_id, sucursal_id, es_principal, activo, creado_en) VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccf', 'cccccccc-cccc-cccc-cccc-cccccccccccc', true, true, now())
ON CONFLICT DO NOTHING;

-- Profesional 5: Empleado multi-sede (Carlos Junior) - atiende en Anapoima y Norte
INSERT INTO usuarios (id, nombre, email, telefono, rol, sucursal_id) VALUES
  ('33333333-3333-3333-3333-333333333333', 'Carlos Junior Barbero', 'carlos.junior@optiturno.com', '3157777777', 'empleado', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')
ON CONFLICT (id) DO NOTHING;

INSERT INTO profesionales (id, usuario_id, especialidad) VALUES
  ('cccccccc-cccc-cccc-cccc-ccccccccccc0', '33333333-3333-3333-3333-333333333333', 'Barbero Junior')
ON CONFLICT DO NOTHING;

INSERT INTO profesional_sucursales (profesional_id, sucursal_id, es_principal, activo, creado_en) VALUES
  ('cccccccc-cccc-cccc-cccc-ccccccccccc0', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', true, true, now()),
  ('cccccccc-cccc-cccc-cccc-ccccccccccc0', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc', false, true, now())
ON CONFLICT DO NOTHING;

-- ============================================================
-- 6. HORARIOS LABORALES (por profesional, por sede)
-- ============================================================

-- Andrés (cccccccc-cccc-cccc-cccc-cccccccccccc) - Sede Central Anapoima: Lun-Vie 8-18
INSERT INTO horarios_laborales (profesional_id, sucursal_id, dia_semana, hora_inicio, hora_fin) VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 1, '08:00:00', '18:00:00'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 2, '08:00:00', '18:00:00'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 3, '08:00:00', '18:00:00'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 4, '08:00:00', '18:00:00'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 5, '08:00:00', '18:00:00')
ON CONFLICT DO NOTHING;

-- Andrés - Sede Norte Bogotá: Sáb 9-14
INSERT INTO horarios_laborales (profesional_id, sucursal_id, dia_semana, hora_inicio, hora_fin) VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc', 6, '09:00:00', '14:00:00')
ON CONFLICT DO NOTHING;

-- Carlos Barbero - Sede Norte: Lun-Sáb 9-18
INSERT INTO horarios_laborales (profesional_id, sucursal_id, dia_semana, hora_inicio, hora_fin) VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccd', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc', 1, '09:00:00', '18:00:00'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccd', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc', 2, '09:00:00', '18:00:00'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccd', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc', 2, '09:00:00', '18:00:00'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccd', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc', 3, '09:00:00', '18:00:00'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccd', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc', 4, '09:00:00', '18:00:00'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccd', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc', 5, '09:00:00', '18:00:00'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccd', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc', 6, '09:00:00', '14:00:00')
ON CONFLICT DO NOTHING;

-- María - Sede Sur Medellín: Lun-Vie 10-19
INSERT INTO horarios_laborales (profesional_id, sucursal_id, dia_semana, hora_inicio, hora_fin) VALUES
  ('cccccccc-cccc-cccc-cccc-ccccccccccce', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbd', 1, '10:00:00', '19:00:00'),
  ('cccccccc-cccc-cccc-cccc-ccccccccccce', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbd', 2, '10:00:00', '19:00:00'),
  ('cccccccc-cccc-cccc-cccc-ccccccccccce', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbd', 3, '10:00:00', '19:00:00'),
  ('cccccccc-cccc-cccc-cccc-ccccccccccce', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbd', 4, '10:00:00', '19:00:00'),
  ('cccccccc-cccc-cccc-cccc-ccccccccccce', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbd', 5, '10:00:00', '19:00:00')
ON CONFLICT DO NOTHING;

-- María - Spa Relax: Sáb 10-15
INSERT INTO horarios_laborales (profesional_id, sucursal_id, dia_semana, hora_inicio, hora_fin) VALUES
  ('cccccccc-cccc-cccc-cccc-ccccccccccce', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 6, '10:00:00', '15:00:00')
ON CONFLICT DO NOTHING;

-- Laura - Spa Relax: Lun-Vie 9-17
INSERT INTO horarios_laborales (profesional_id, sucursal_id, dia_semana, hora_inicio, hora_fin) VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccf', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 1, '09:00:00', '17:00:00'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccf', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 2, '09:00:00', '17:00:00'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccf', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, '09:00:00', '17:00:00'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccf', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 4, '09:00:00', '17:00:00'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccf', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 5, '09:00:00', '17:00:00')
ON CONFLICT DO NOTHING;

-- Carlos Junior - Anapoima: Lun-Mie 14-20, Norte: Jue-Vie 14-20
INSERT INTO horarios_laborales (profesional_id, sucursal_id, dia_semana, hora_inicio, hora_fin) VALUES
  ('cccccccc-cccc-cccc-cccc-ccccccccccc0', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 1, '14:00:00', '20:00:00'),
  ('cccccccc-cccc-cccc-cccc-ccccccccccc0', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 2, '14:00:00', '20:00:00'),
  ('cccccccc-cccc-cccc-cccc-ccccccccccc0', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 3, '14:00:00', '20:00:00'),
  ('cccccccc-cccc-cccc-cccc-ccccccccccc0', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc', 4, '14:00:00', '20:00:00'),
  ('cccccccc-cccc-cccc-cccc-ccccccccccc0', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc', 5, '14:00:00', '20:00:00')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 7. VINCULAR NEGOCIOS A SUPERADMIN
-- ============================================================
UPDATE negocios
SET admin_usuario_id = '00000000-0000-0000-0000-000000000001'
WHERE admin_usuario_id IS NULL;