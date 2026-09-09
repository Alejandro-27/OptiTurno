import { supabase } from "../config/database";

// Horarios por defecto aplicados al profesional recién creado
const HORARIOS_DEFECTO = [
  { dia_semana: 1, hora_inicio: "08:00:00", hora_fin: "18:00:00" },
  { dia_semana: 2, hora_inicio: "08:00:00", hora_fin: "18:00:00" },
  { dia_semana: 3, hora_inicio: "08:00:00", hora_fin: "18:00:00" },
  { dia_semana: 4, hora_inicio: "08:00:00", hora_fin: "18:00:00" },
  { dia_semana: 5, hora_inicio: "08:00:00", hora_fin: "18:00:00" },
];

export const profesionalesService = {
  async crear(datos: {
    sucursal_id: string;
    nombre: string;
    email?: string;
    especialidad?: string;
    telefono?: string;
  }) {
    const { sucursal_id, nombre, email, especialidad, telefono } = datos;

    if (!sucursal_id || !nombre) {
      throw { status: 400, message: "Faltan campos obligatorios." };
    }

    // 1. Crear la cuenta en Supabase Auth (de un solo golpe y confirmada).
    //    Requiere email obligatorio, igual que el registro público de clientes.
    if (!email) {
      throw {
        status: 400,
        message: "El email es obligatorio para registrar un profesional.",
      };
    }

    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password: `OptiTurno#${Math.random().toString(36).slice(2, 8)}`,
        email_confirm: true,
        user_metadata: { nombre, telefono: telefono || null },
      });

    if (authError) {
      throw {
        status: 400,
        message: authError.message.includes("already registered")
          ? "Ya existe una cuenta con ese correo."
          : "No se pudo crear la cuenta del profesional.",
      };
    }

    const usuarioId = authData.user.id;

    // 2. Perfil espejo en la tabla pública 'usuarios'
    const { data: perfil, error: perfilError } = await supabase
      .from("usuarios")
      .insert([
        {
          id: usuarioId,
          nombre,
          email,
          telefono: telefono || null,
          rol: "cliente",
        },
      ])
      .select()
      .single();

    if (perfilError) {
      throw {
        status: 400,
        message: "No se pudo completar el perfil del profesional.",
      };
    }

    // 3. Vínculo con la sucursal en 'profesionales'
    const { data: profesional, error: profError } = await supabase
      .from("profesionales")
      .insert([
        {
          usuario_id: usuarioId,
          sucursal_id,
          especialidad: especialidad || "General",
        },
      ])
      .select()
      .single();

    if (profError) {
      throw {
        status: 400,
        message: "No se pudo vincular el profesional a la sucursal.",
      };
    }

    // 4. Horarios laborales por defecto (lunes a viernes)
    const { error: horarioError } = await supabase
      .from("horarios_laborales")
      .insert(
        HORARIOS_DEFECTO.map((h) => ({
          profesional_id: profesional.id,
          ...h,
        })),
      );

    if (horarioError) {
      throw {
        status: 400,
        message: "No se pudieron asignar los horarios por defecto.",
      };
    }

    return {
      id: profesional.id,
      especialidad: profesional.especialidad,
      sucursal_id,
      usuarios: {
        id: perfil.id,
        nombre: perfil.nombre,
        email: perfil.email,
      },
    };
  },

  async editar(
    id: string,
    datos: { nombre?: string; especialidad?: string; telefono?: string },
  ) {
    const { data: profesional, error: profError } = await supabase
      .from("profesionales")
      .select("id, usuario_id, sucursal_id, especialidad")
      .eq("id", id)
      .single();

    if (profError || !profesional) {
      throw { status: 404, message: "Profesional no encontrado." };
    }

    // 1. Actualizar la especialidad (si viene)
    if (datos.especialidad !== undefined) {
      const { error } = await supabase
        .from("profesionales")
        .update({ especialidad: datos.especialidad })
        .eq("id", id);
      if (error) {
        throw { status: 400, message: "No se pudo actualizar el profesional." };
      }
    }

    // 2. Actualizar nombre/teléfono en el perfil espejo 'usuarios' (si vienen)
    const perfil: { nombre?: string; telefono?: string | null } = {};
    if (datos.nombre !== undefined) perfil.nombre = datos.nombre;
    if (datos.telefono !== undefined) perfil.telefono = datos.telefono || null;
    if (Object.keys(perfil).length > 0) {
      const { error } = await supabase
        .from("usuarios")
        .update(perfil)
        .eq("id", profesional.usuario_id);
      if (error) {
        throw { status: 400, message: "No se pudo actualizar el perfil." };
      }
    }

    // 3. Devolver el profesional actualizado (mismo shape que el listado)
    const { data: actualizado, error: finalError } = await supabase
      .from("profesionales")
      .select(
        `
          id,
          especialidad,
          sucursal_id,
          usuarios:usuario_id (id, nombre, email)
        `,
      )
      .eq("id", id)
      .single();

    if (finalError || !actualizado) {
      throw { status: 400, message: "No se pudo consultar el profesional." };
    }
    return actualizado;
  },

  async eliminar(id: string) {
    const { data: profesional, error: profError } = await supabase
      .from("profesionales")
      .select("id, usuario_id")
      .eq("id", id)
      .single();

    if (profError || !profesional) {
      throw { status: 404, message: "Profesional no encontrado." };
    }

    // 1. Eliminar el vínculo (cascada: turnos y horarios_laborales del profesional)
    const { error: deleteError } = await supabase
      .from("profesionales")
      .delete()
      .eq("id", id);

    if (deleteError) {
      throw {
        status: 400,
        message: "No se pudo eliminar el profesional.",
      };
    }

    // 2. Limpiar el perfil espejo 'usuarios' (mejor esfuerzo)
    await supabase.from("usuarios").delete().eq("id", profesional.usuario_id).eq("rol", "cliente");

    return { id, eliminado: true };
  },
};