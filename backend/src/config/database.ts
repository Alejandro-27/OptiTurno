import { createClient } from "@supabase/supabase-js";
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
// Clave de servicio
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Faltan las variables de entorno de Supabase necesarias.");
}

// Inicializa el cliente de Supabase con privilegios de servicio para el Backend
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

console.log('🌲 Cliente de Supabase inicializado con service_role');