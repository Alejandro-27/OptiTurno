import { supabase } from "../config/database";

const INTERVALO_MS =
  Number(process.env.KEEP_ALIVE_INTERVAL_MS) || 15 * 60 * 1000;
const URL_RENDER =
  process.env.KEEP_ALIVE_RENDER_URL || "https://optiturno.onrender.com";

let temporizador: NodeJS.Timeout | null = null;

async function ping() {
  // Render: salud propio (solo si el servicio ya está despierto).
  try {
    await fetch(`${URL_RENDER}/api/ping`, {
      method: "GET",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    // silencioso: se reintenta en el siguiente ciclo.
  }

  // Supabase: consulta ligera, solo headers, sin traer filas.
  try {
    await supabase.from("usuarios").select("id", { head: true }).limit(1);
  } catch {
    // silencioso.
  }
}

export function iniciarKeepAlive() {
  if (process.env.NODE_ENV !== "production") return;
  if (process.env.KEEP_ALIVE_ENABLED === "false") return;
  if (temporizador) return;

  ping();
  temporizador = setInterval(ping, INTERVALO_MS);
}

export function detenerKeepAlive() {
  if (temporizador) {
    clearInterval(temporizador);
    temporizador = null;
  }
}
