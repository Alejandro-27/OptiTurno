import { supabase, supabaseAuth } from "../config/database";

// Roles que un usuario puede solicitar en el registro público.
// NUNCA incluir 'superadmin': ese rol solo debe asignarse manualmente en la BD.
const ROLES_REGISTRO_PERMITIDOS = ["cliente", "admin_negocio"] as const;

interface RegistrarDatos {
  email: string;
  password: string;
  nombre: string;
  telefono?: string;
  rol?: string;
}

export const usuariosService = {
  async registrar(datos: RegistrarDatos) {
    const rol =
      datos.rol && (ROLES_REGISTRO_PERMITIDOS as readonly string[]).includes(datos.rol)
        ? datos.rol
        : "cliente";

    // USAR EL MODULO ADMIN: Registra y confirma al usuario de un solo golpe automáticamente
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: datos.email,
      password: datos.password,
      email_confirm: true, // <--- Esto lo activa de inmediato sin mandar correos
      user_metadata: { nombre: datos.nombre, telefono: datos.telefono || null },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No se pudo generar el registro de autenticación.');

    const userUUID = authData.user.id;

    // 2. Insertar los datos en tu tabla espejo pública 'usuarios'
    const { data: perfilData, error: perfilError } = await supabase
      .from('usuarios')
      .insert([
        {
          id: userUUID,
          nombre: datos.nombre,
          email: datos.email,
          telefono: datos.telefono || null,
          rol
        }
      ])
      .select();

    if (perfilError) throw perfilError;

    // Retornamos el objeto estructurado
    if (!perfilData || perfilData.length === 0) {
      return {
        id: userUUID,
        nombre: datos.nombre,
        email: datos.email,
        telefono: datos.telefono || null,
        rol
      };
    }

    return perfilData[0];
  },

  // Iniciar sesión (clientes PWA): valida credenciales contra Supabase Auth
  // y devuelve el token JWT junto al perfil espejo de la tabla 'usuarios'
  async login(datos: { email: string; password: string }) {
    if (!supabaseAuth) {
      throw new Error(
        "El login no está disponible: configura SUPABASE_ANON_KEY en el backend.",
      );
    }

    const { data: sesionData, error: sesionError } =
      await supabaseAuth.auth.signInWithPassword({
        email: datos.email,
        password: datos.password,
      });

    if (sesionError || !sesionData.user || !sesionData.session) {
      throw { status: 401, message: "Credenciales inválidas." };
    }

    // Buscar el perfil espejo y su rol en la tabla pública 'usuarios'
    const { data: perfil, error: perfilError } = await supabase
      .from("usuarios")
      .select("id, email, nombre, telefono, rol")
      .eq("id", sesionData.user.id)
      .single();

    if (perfilError || !perfil) {
      throw {
        status: 403,
        message:
          "Tu cuenta no tiene un perfil configurado en el sistema. Regístrate de nuevo.",
      };
    }

    return {
      token: sesionData.session.access_token,
      usuario: perfil,
    };
  },

  // Devuelve el perfil espejo del usuario autenticado
  async obtenerPerfil(usuarioId: string) {
    const { data: perfil, error } = await supabase
      .from("usuarios")
      .select("id, email, nombre, telefono, rol")
      .eq("id", usuarioId)
      .single();

    if (error || !perfil) {
      throw { status: 404, message: "Perfil no encontrado." };
    }

    return perfil;
  },

  // Actualiza los datos editables del perfil espejo
  async actualizarPerfil(usuarioId: string, datos: { nombre?: string; telefono?: string }) {
    const campos: { nombre?: string; telefono?: string } = {};
    if (datos.nombre !== undefined) campos.nombre = datos.nombre;
    if (datos.telefono !== undefined) campos.telefono = datos.telefono;

    if (Object.keys(campos).length === 0) {
      throw { status: 400, message: "No hay campos para actualizar." };
    }

    const { data: actualizado, error } = await supabase
      .from("usuarios")
      .update(campos)
      .eq("id", usuarioId)
      .select("id, email, nombre, telefono, rol")
      .single();

    if (error) throw { status: 400, message: error.message };

    return actualizado;
  },
};