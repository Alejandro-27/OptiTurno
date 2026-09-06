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
};