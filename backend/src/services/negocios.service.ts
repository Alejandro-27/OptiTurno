import { supabase } from "../config/database";

// Obtiene todos los servicios ofrecidos por una sucursal junto con su precio y duración
export const obtenerServiciosPorSucursalService = async (
  sucursalId: string,
) => {
  const { data, error } = await supabase
    .from("servicios")
    .select("id, nombre, descripción, precio, duracion_minutos")
    .eq("sucursal_id", sucursalId);

  if (error) throw error;
  return data;
};

// Obtiene la lista de profesionales que atienden en una sucursal específica

export const obtenerProfesionalesPorSucursalService = async (
  sucursalId: string,
) => {
  const { data, error } = await supabase
    .from("profesionales")
    .select(
      `
          id,
          especialidad,
          usuario_id
        `,
    )
    .eq("sucursal_id", sucursalId);

  if (error) throw error;
  return data;
};

// Script semilla para insertar datos iniciales de prueba en la base de datos

export const sembrarDatosInicialesService = async () => {
  // Crear un usuario de prueba para el PROFESIONAL en la tabla 'usuarios'
  const { data: usuarioProf, error: errUserProf } = await supabase
    .from("usuarios")
    .insert([
      {
        id: "11111111-1111-1111-1111-111111111111", // UUID estático y fácil para desarrollo
        nombre: "Andrés Barbero Master",
        email: "andres.master@optiturno.com",
        telefono: "3159999999",
      },
    ])
    .select()
    .single();

  // Si el usuario ya existe por una ejecución previa, ignoramos el error y continuamos
  if (errUserProf && !errUserProf.message.includes("duplicate key")) {
    throw {
      status: 400,
      message: `Error al crear usuario profesional: ${errUserProf.message}`,
    };
  }

  // Crear un usuario de prueba para el CLIENTE en la tabla 'usuarios'
  const { data: usuarioCli, error: errUserCli } = await supabase
    .from("usuarios")
    .insert([
      {
        id: "22222222-2222-2222-2222-222222222222", // Otro UUID estático de prueba
        nombre: "Alejandro Cliente Prueba",
        email: "alejandro.test@gmail.com",
        telefono: "3102222222",
      },
    ])
    .select()
    .single();

  if (errUserCli && !errUserCli.message.includes("duplicate key")) {
    throw {
      status: 400,
      message: `Error al crear usuario cliente: ${errUserCli.message}`,
    };
  }

  // Crear el negocio
  const { data: negocio, error: errN } = await supabase
    .from("negocios")
    .insert([{ nombre: "Barbería El Elegante", slug: "barberia-el-elegante" }])
    .select()
    .single();

  if (errN)
    throw { status: 400, message: `Error al crear negocio: ${errN.message}` };

  // Crear la sucursal
  const { data: sucursal, error: errS } = await supabase
    .from("sucursales")
    .insert([
      {
        negocio_id: negocio.id,
        nombre: "Sede Central Anapoima",
        direccion: "Calle 4 #5-12",
        telefono: "3101234567",
      },
    ])
    .select()
    .single();

  if (errS)
    throw { status: 400, message: `Error al crear sucursal: ${errS.message}` };

  // Crear los servicios
  const { data: servicios, error: errSer } = await supabase
    .from("servicios")
    .insert([
      {
        sucursal_id: sucursal.id,
        nombre: "Corte de Cabello Premium",
        descripcion: "Incluye lavado y perfilado de cejas",
        precio: 25000,
        duracion_minutos: 30,
      },
      {
        sucursal_id: sucursal.id,
        nombre: "Barba Esculpida y Toalla Caliente",
        descripcion: "Ritual tradicional con navaja",
        precio: 18000,
        duracion_minutos: 30,
      },
      {
        sucursal_id: sucursal.id,
        nombre: "Combo Rey (Corte + Barba)",
        descripcion: "El servicio completo de la casa",
        precio: 38000,
        duracion_minutos: 60,
      },
    ])
    .select();

  if (errSer)
    throw {
      status: 400,
      message: `Error al crear servicios: ${errSer.message}`,
    };

  // Crear el Profesional apuntando al usuario '11111111...' que creamos en el paso 1
  const { data: profesional, error: errProf } = await supabase
    .from("profesionales")
    .insert([
      {
        usuario_id: "11111111-1111-1111-1111-111111111111",
        sucursal_id: sucursal.id,
        especialidad: "Barbero Master / Estilista",
      },
    ])
    .select()
    .single();

  if (errProf)
    throw {
      status: 400,
      message: `Error al crear profesional: ${errProf.message}`,
    };

  // Crear los horarios laborales para el profesional
  const { error: errHorario } = await supabase
    .from("horarios_laborales")
    .insert([
      {
        profesional_id: profesional.id,
        dia_semana: 1,
        hora_inicio: "08:00:00",
        hora_fin: "18:00:00",
      },
      {
        profesional_id: profesional.id,
        dia_semana: 2,
        hora_inicio: "08:00:00",
        hora_fin: "18:00:00",
      },
      {
        profesional_id: profesional.id,
        dia_semana: 3,
        hora_inicio: "08:00:00",
        hora_fin: "18:00:00",
      },
      {
        profesional_id: profesional.id,
        dia_semana: 4,
        hora_inicio: "08:00:00",
        hora_fin: "18:00:00",
      },
      {
        profesional_id: profesional.id,
        dia_semana: 5,
        hora_inicio: "08:00:00",
        hora_fin: "18:00:00",
      },
    ]);

  if (errHorario)
    throw {
      status: 400,
      message: `Error al crear horarios: ${errHorario.message}`,
    };

  // Retornamos el payload listo con llaves descriptivas para mapear en Bruno
  return {
    mensaje: "Base de datos sembrada con éxito en Supabase.",
    IDs_Para_Bruno: {
      cliente_id_fijo: "22222222-2222-2222-2222-222222222222",
      sucursal_id: sucursal.id,
      profesional_id: profesional.id,
      servicio_id_corte: servicios[0].id,
      servicio_id_barba: servicios[1].id,
      servicio_id_combo: servicios[2].id,
    },
  };
};
