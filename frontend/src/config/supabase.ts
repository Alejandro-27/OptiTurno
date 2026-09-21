import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env";

// Cliente usado únicamente para Supabase Realtime (postgres_changes sobre la
// tabla turnos). Si faltan las credenciales VITE_* se exporta null y la app
// sigue funcionando sin suscripciones (el refresco manual sigue disponible).
export const supabase: SupabaseClient | null =
  env.SUPABASE_URL && env.SUPABASE_ANON_KEY
    ? createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
        realtime: { params: { eventsPerSecond: 10 } },
      })
    : null;
