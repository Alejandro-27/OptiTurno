import { createClient } from "@supabase/supabase-js";
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Faltan las variables de entorno de Supabase necesarias.");
}

// Cliente de Supabase con privilegios de servicio para el Backend (lectura/escritura total)
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

// Cliente anónimo exclusivo para operaciones de autenticación (login de clientes).
// No reemplaza al de servicio: solo se usa para signInWithPassword / signUp.
export const supabaseAuth = supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  : null;

console.log('🌲 Cliente de Supabase inicializado con service_role');
if (!supabaseAuth) {
  console.warn('⚠️  SUPABASE_ANON_KEY no configurada: el login de clientes (/api/usuarios/login) no estará disponible.');
}