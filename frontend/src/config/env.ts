export const env = {
  API_URL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || "",
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
  GA_MEASUREMENT_ID: import.meta.env.VITE_GA_MEASUREMENT_ID || "",
};

export function usarMocks(): boolean {
  const bandera = import.meta.env.VITE_USE_MOCKS;
  if (bandera === "true" || bandera === "1") return true;

  if (bandera === "false" || bandera === "0") return false;

  return !import.meta.env.VITE_API_URL;
  //return bandera === "true" || bandera === "1";
}

export const MODO_PRUEBA = usarMocks();
