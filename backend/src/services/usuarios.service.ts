import { supabase } from "../config/database";

export const usuariosService = {
  async registrar(datos: { email: string; password: string; nombre: string; telefono?: string; rol?: string }) {
    
    // 💡 USAR EL MODULO ADMIN: Registra y confirma al usuario de un solo golpe automáticamente
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: datos.email,
      password: datos.password,
      email_confirm: true // <--- Esto lo activa de inmediato sin mandar correos
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
          rol: datos.rol || 'cliente'
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
        rol: datos.rol || 'cliente'
      };
    }

    return perfilData[0];
  }
};
