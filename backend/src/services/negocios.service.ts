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
          usuarios (
            id,
            nombre,
            email
          )
        `,
    )
    .eq("sucursal_id", sucursalId);

  if (error) throw error;
  return data;
};

// Script semilla para insertar datos iniciales de prueba en la base de datos

export const sembrarDatosInicialesService = async () => {
  // Crear un negocio de prueba
  const { data: negocio, error: errN } = await supabase
    .from("negocios")
    .insert([{ nombre: "Barbería El Elegante", slug: "barberia-el-elegante" }])
    .select()
    .single();
  if (errN) throw errN;

  // Crear una sucursal
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
  if (errS) throw errS;

  // Crear servicios típicos
  const { data: servicios, error: errSer } = await supabase
    .from("servicios")
    .insert([
      {
        sucursal_id: sucursal.id,
        nombre: "Corte de Cabello Premium",
        descripcion: "Incluye lavado y perfilado de cejas",
        precio: 25000.0,
        duracion_minutos: 30,
      },
      {
        sucursal_id: sucursal.id,
        nombre: "Barba Esculpida y Toalla Caliente",
        descripcion: "Ritual tradicional con navaja",
        precio: 18000.0,
        duracion_minutos: 30,
      },
      {
        sucursal_id: sucursal.id,
        nombre: "Combo Rey (Corte + Barba)",
        descripcion: "El servicio completo de la casa",
        precio: 38000.0,
        duracion_minutos: 60,
      },
    ])
    .select();
  if (errSer) throw errSer;

  return {
    mensaje: "Base de datos sembrada con éxito para pruebas.",
    negocioId: negocio.id,
    sucursalId: sucursal.id,
    serviciosInsertados: servicios.length,
  };
};
