import { supabase } from "../config/database";
import { CLAVES, invalidar, leerConCache } from "../config/cache";

// Horarios por defecto aplicados al profesional recién creado
const HORARIOS_DEFECTO = [
  { dia_semana: 1, hora_inicio: "08:00:00", hora_fin: "18:00:00" },
  { dia_semana: 2, hora_inicio: "08:00:00", hora_fin: "18:00:00" },
  { dia_semana: 3, hora_inicio: "08:00:00", hora_fin: "18:00:00" },
  { dia_semana: 4, hora_inicio: "08:00:00", hora_fin: "18:00:00" },
  { dia_semana: 5, hora_inicio: "08:00:00", hora_fin: "18:00:00" },
];

// Días de la semana en el orden de la UI, con su índice en la BD
const DIAS_SEMANA: Array<{ label: string; numero: number }> = [
  { label: "Lunes", numero: 1 },
  { label: "Martes", numero: 2 },
  { label: "Miércoles", numero: 3 },
  { label: "Jueves", numero: 4 },
  { label: "Viernes", numero: 5 },
  { label: "Sábado", numero: 6 },
  { label: "Domingo", numero: 0 },
];

const HORARIO_DEFECTO = {
  openTime: "09:00",
  closeTime: "18:00",
  restStart: "13:00",
  restEnd: "14:00",
};

const horaCorta = (hora: string): string => hora.slice(0, 5);

export const consultarPropietarioService = async (profesionalId: string) => {
  const { data, error } = await supabase
    .from("profesionales")
    .select("usuario_id")
    .eq("id", profesionalId)
    .maybeSingle();

  if (error) throw error;
  return data?.usuario_id || null;
};

// Semana laboral de un profesional puntual (panel del empleado)
// Caché 10 min por profesional; se invalida al guardar horarios.
export const obtenerHorarioSemanalService = async (profesionalId: string) =>
  leerConCache(CLAVES.horarios(profesionalId), 600, async () => {
    const { data: horarios, error } = await supabase
      .from("horarios_laborales")
      .select("dia_semana, hora_inicio, hora_fin")
      .eq("profesional_id", profesionalId);

    if (error) throw error;

    const filaVacia = (label: string) => ({
      day: label,
      enabled: false,
      ...HORARIO_DEFECTO,
    });

    return DIAS_SEMANA.map((d) => {
      const horario = (horarios || []).find((h) => h.dia_semana === d.numero);
      if (!horario) return filaVacia(d.label);
      return {
        day: d.label,
        enabled: true,
        ...HORARIO_DEFECTO,
        openTime: horaCorta(horario.hora_inicio),
        closeTime: horaCorta(horario.hora_fin),
      };
    });
  });

// Reemplaza la semana laboral completa de un profesional puntual
export const guardarHorarioSemanalService = async (
  profesionalId: string,
  schedule: Array<{
    day: string;
    enabled: boolean;
    openTime: string;
    closeTime: string;
    restStart: string;
    restEnd: string;
  }>,
) => {
  const propietario = await consultarPropietarioService(profesionalId);
  if (!propietario) {
    throw { status: 404, message: "Profesional no encontrado." };
  }

  // Resolver la sucursal del profesional (sede principal en profesional_sucursales o sucursal_id directa)
  const { data: ps } = await supabase
    .from("profesional_sucursales")
    .select("sucursal_id")
    .eq("profesional_id", profesionalId)
    .eq("es_principal", true)
    .eq("activo", true)
    .maybeSingle();

  let sucursalId = ps?.sucursal_id;
  if (!sucursalId) {
    const { data: prof } = await supabase
      .from("profesionales")
      .select("sucursal_id")
      .eq("id", profesionalId)
      .maybeSingle();
    sucursalId = prof?.sucursal_id;
  }

  for (const dia of DIAS_SEMANA) {
    const registro = schedule.find((s) => s.day === dia.label);
    const habilitado = registro?.enabled === true;

    let deleteQuery = supabase
      .from("horarios_laborales")
      .delete()
      .eq("profesional_id", profesionalId)
      .eq("dia_semana", dia.numero);

    if (sucursalId) {
      deleteQuery = deleteQuery.eq("sucursal_id", sucursalId);
    }
    await deleteQuery;

    if (habilitado && registro) {
      const fila: Record<string, unknown> = {
        profesional_id: profesionalId,
        dia_semana: dia.numero,
        hora_inicio: `${registro.openTime}:00`,
        hora_fin: `${registro.closeTime}:00`,
      };
      if (sucursalId) {
        fila.sucursal_id = sucursalId;
      }
      const { error } = await supabase
        .from("horarios_laborales")
        .insert([fila]);
      if (error) throw error;
    }
  }

  await invalidar(
    CLAVES.horariosGeneral,
    CLAVES.dispGeneral,
    CLAVES.dispSemanalGeneral,
  );

  return obtenerHorarioSemanalService(profesionalId);
};

export const profesionalesService = {
  // Lista profesionales con filtro por sucursal (para admin_negocio) o sin filtro (superadmin)
  async listar(filtro?: { sucursalId?: string }) {
    let query = supabase.from("profesionales").select(
      `
          id,
          especialidad,
          sucursal_id,
          usuarios:usuario_id (id, nombre, email),
          profesional_sucursales!profesional_id (sucursal_id, es_principal, activo)
        `,
    );

    if (filtro?.sucursalId) {
      const { data: profesionalesIds } = await supabase
        .from("profesional_sucursales")
        .select("profesional_id")
        .eq("sucursal_id", filtro.sucursalId)
        .eq("activo", true);

      const ids = (profesionalesIds ?? []).map((p) => p.profesional_id);
      if (ids.length === 0) return [];
      query = query.in("id", ids);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async crear(datos: {
    sucursal_id?: string;
    sucursal_ids?: string[];
    nombre: string;
    email?: string;
    password?: string;
    rol?: "empleado" | "admin_negocio";
    especialidad?: string;
    telefono?: string;
  }) {
    const {
      sucursal_id,
      sucursal_ids,
      nombre,
      email,
      password,
      rol = "empleado",
      especialidad,
      telefono,
    } = datos;

    const esSuperadmin = sucursal_ids && sucursal_ids.length > 0;
    const sucursalPrincipal = esSuperadmin ? sucursal_ids[0] : sucursal_id;

    if (!sucursalPrincipal || !nombre) {
      throw { status: 400, message: "Faltan campos obligatorios." };
    }

    if (!email) {
      throw {
        status: 400,
        message: "El email es obligatorio para registrar un profesional.",
      };
    }

    const pwd =
      password || `OptiTurno#${Math.random().toString(36).slice(2, 8)}`;

    // 1. Crear la cuenta en Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password: pwd,
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
    const { error: perfilError } = await supabase.from("usuarios").upsert(
      {
        id: usuarioId,
        nombre,
        email,
        telefono: telefono || null,
        rol,
        sucursal_id: (sucursal_ids && sucursal_ids[0]) || sucursalPrincipal, // sede principal
      },
      { onConflict: "id" },
    );

    if (perfilError) {
      if (perfilError.code === "23505" && rol === "admin_negocio") {
        throw {
          status: 409,
          message: "Esa sede ya tiene un administrador asignado.",
        };
      }
      throw { status: 400, message: "No se pudo completar el perfil." };
    }

    // 2. Vínculo con la(s) sucursal(es) en 'profesionales' y 'profesional_sucursales'
    const sucursalesParaVincular =
      sucursal_ids && sucursal_ids.length > 0
        ? sucursal_ids
        : [sucursalPrincipal];

    // Primero crear/actualizar el profesional (tabla profesionales)
    const { data: prof, error: profErr } = await supabase
      .from("profesionales")
      .insert({
        usuario_id: usuarioId,
        sucursal_id: sucursalPrincipal,
        especialidad: especialidad || "General",
      })
      .select()
      .single();

    if (profErr)
      throw {
        status: 400,
        message: "No se pudo crear/actualizar el profesional.",
      };

    const profesionalId = prof.id;

    // 2. Vincular a sucursal(es) en profesional_sucursales
    for (let i = 0; i < sucursalesParaVincular.length; i++) {
      const sucId = sucursalesParaVincular[i];
      const { error: psError } = await supabase
        .from("profesional_sucursales")
        .upsert(
          {
            profesional_id: profesionalId,
            sucursal_id: sucId,
            es_principal: i === 0,
            activo: true,
          },
          { onConflict: "profesional_id,sucursal_id" },
        );
      if (psError)
        throw {
          status: 400,
          message: `No se pudo vincular a la sucursal ${sucId}.`,
        };
    }

    // 3. Horarios laborales por defecto (lunes a viernes) - solo en la sede principal
    const { error: horarioError } = await supabase
      .from("horarios_laborales")
      .upsert(
        HORARIOS_DEFECTO.map((h) => ({
          profesional_id: profesionalId,
          sucursal_id: sucursalPrincipal,
          ...h,
        })),
        { onConflict: "profesional_id,sucursal_id,dia_semana" },
      );
    if (horarioError) {
      throw {
        status: 400,
        message: "No se pudieron asignar los horarios por defecto.",
      };
    }

    await invalidar(
      CLAVES.profesionalesSucursal,
      CLAVES.dispSemanalGeneral,
      CLAVES.dispGeneral,
      CLAVES.horariosGeneral,
    );

    return {
      id: profesionalId,
      especialidad: "General",
      sucursal_id: sucursalPrincipal,
      usuarios: { nombre, email },
    };
  },

  async editar(
    id: string,
    datos: {
      nombre?: string;
      especialidad?: string;
      telefono?: string;
      sucursal_ids?: string[];
    },
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
      if (error)
        throw { status: 400, message: "No se pudo actualizar el profesional." };
    }

    // 2. Actualizar nombre/teléfono en el perfil espejo 'usuarios'
    const perfil: { nombre?: string; telefono?: string | null } = {};
    if (datos.nombre !== undefined) perfil.nombre = datos.nombre;
    if (datos.telefono !== undefined) perfil.telefono = datos.telefono || null;
    if (Object.keys(perfil).length > 0) {
      const { error } = await supabase
        .from("usuarios")
        .update(perfil)
        .eq("id", profesional.usuario_id);
      if (error)
        throw { status: 400, message: "No se pudo actualizar el perfil." };
    }

    // 3. Si superadmin envía sucursal_ids, actualizar profesional_sucursales
    if (datos.sucursal_ids !== undefined && datos.sucursal_ids.length > 0) {
      // Desactivar todas las sedes actuales
      await supabase
        .from("profesional_sucursales")
        .update({ activo: false })
        .eq("profesional_id", id);

      // Activar/crear las nuevas
      for (let i = 0; i < datos.sucursal_ids.length; i++) {
        const sucId = datos.sucursal_ids[i];
        const { error: psError } = await supabase
          .from("profesional_sucursales")
          .upsert(
            {
              profesional_id: id,
              sucursal_id: sucId,
              es_principal: i === 0,
              activo: true,
            },
            { onConflict: "profesional_id,sucursal_id" },
          );
        if (psError)
          throw {
            status: 400,
            message: `No se pudo vincular a la sucursal ${sucId}.`,
          };
      }
    }

    // Devolver el profesional actualizado
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
    await invalidar(CLAVES.profesionalesSucursal);
    return actualizado;
  },

  async cambiarEstado(id: string, activo: boolean) {
    const { data: profesional, error: profError } = await supabase
      .from("profesionales")
      .select("id")
      .eq("id", id)
      .single();

    if (profError || !profesional) {
      throw { status: 404, message: "Profesional no encontrado." };
    }

    // Actualizar profesional_sucursales (soft-delete/activate)
    const { error } = await supabase
      .from("profesional_sucursales")
      .update({ activo })
      .eq("profesional_id", id);

    if (error)
      throw {
        status: 400,
        message: "No se pudo cambiar el estado del profesional.",
      };

    await invalidar(
      CLAVES.profesionalesSucursal,
      CLAVES.dispSemanalGeneral,
      CLAVES.dispGeneral,
      CLAVES.horariosGeneral,
    );

    return { id, activo };
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

    // Eliminar el vínculo (cascada: turnos y horarios_laborales del profesional)
    const { error: deleteError } = await supabase
      .from("profesionales")
      .delete()
      .eq("id", id);

    if (deleteError) {
      throw { status: 400, message: "No se pudo eliminar el profesional." };
    }

    // Limpiar el perfil espejo 'usuarios' (mejor esfuerzo)
    await supabase
      .from("usuarios")
      .delete()
      .eq(
        "id",
        (
          await supabase
            .from("profesionales")
            .select("usuario_id")
            .eq("id", id)
            .single()
        ).data?.usuario_id,
      )
      .eq("rol", "empleado");

    await invalidar(
      CLAVES.profesionalesSucursal,
      CLAVES.dispSemanalGeneral,
      CLAVES.horariosGeneral,
      CLAVES.dispGeneral,
    );

    return { id, eliminado: true };
  },
};
