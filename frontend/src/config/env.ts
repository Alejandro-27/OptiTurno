export const env = {
  API_URL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || "",
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
};

export function usarMocks(): boolean {
  const bandera = import.meta.env.VITE_USE_MOCKS;
  if (bandera === "true" || bandera === "1") return true;
  if (bandera === "false" || bandera === "0") return false;
  return !import.meta.env.VITE_API_URL;
}

export const MODO_DEMO = usarMocks();