import { supabase } from "../config/database";
import { CLAVES, invalidar } from "../config/cache";

export interface OnboardingInput {
  nombre: string;
  slug: string;
  sucursal: {
    nombre: string;
    direccion: string;
    telefono: string;
  };
}

export interface OnboardingResultado {
  negocio: {
    id: string;
    nombre: string;
    slug: string;
  };
  sucursal: {
    id: string;
    nombre: string;
    direccion: string;
    telefono: string;
  };
}

/**
 * Crea el negocio y su sucursal principal, y vincula al usuario autenticado
 * como dueño (admin_negocio).
 * Falla si el usuario ya tiene un negocio asociado.
 */
export const crearNegocioOnboardingService = async (
  usuarioId: string,
  input: OnboardingInput,
): Promise<OnboardingResultado> => {
  // Verificar que el usuario no tenga ya un negocio
  const { data: existente } = await supabase
    .from("negocios")
    .select("id")
    .eq("admin_usuario_id", usuarioId)
    .maybeSingle();

  if (existente) {
    throw {
      status: 409,
      message: "Ya tienes un negocio creado. Contacta a soporte para cambios.",
    };
  }

  // Crear negocio
  const { data: negocio, error: errNegocio } = await supabase
    .from("negocios")
    .insert([
      {
        nombre: input.nombre,
        slug: input.slug,
        admin_usuario_id: usuarioId,
      },
    ])
    .select()
    .single();

  if (errNegocio) {
    if (errNegocio.code === "23505") {
      throw {
        status: 409,
        message: "El slug ya está en uso. Elige otro.",
      };
    }
    throw { status: 400, message: "No se pudo crear el negocio." };
  }

  // Crear sucursal principal
  const { data: sucursal, error: errSucursal } = await supabase
    .from("sucursales")
    .insert([
      {
        negocio_id: negocio.id,
        nombre: input.sucursal.nombre,
        direccion: input.sucursal.direccion,
        telefono: input.sucursal.telefono,
      },
    ])
    .select()
    .single();

  if (errSucursal) {
    // Rollback negocio si falla la sucursal
    await supabase.from("negocios").delete().eq("id", negocio.id);
    throw { status: 400, message: "No se pudo crear la sucursal." };
  }

  // Invalidar cachés de catálogos públicos
  await invalidar(CLAVES.sucursales, CLAVES.sucursalPorId(sucursal.id));

  return {
    negocio: {
      id: negocio.id,
      nombre: negocio.nombre,
      slug: negocio.slug,
    },
    sucursal: {
      id: sucursal.id,
      nombre: sucursal.nombre,
      direccion: sucursal.direccion,
      telefono: sucursal.telefono,
    },
  };
};

/**
 * Resuelve el negocio del usuario autenticado (admin_negocio).
 * Devuelve null si no tiene negocio vinculado.
 */
export const obtenerMiNegocioService = async (usuarioId: string) => {
  const { data, error } = await supabase
    .from("negocios")
    .select(
      "id, nombre, slug, admin_usuario_id, sucursales: sucursales (id, nombre, direccion, telefono)",
    )
    .eq("admin_usuario_id", usuarioId)
    .maybeSingle();

  if (error) throw error;
  return data;
};
