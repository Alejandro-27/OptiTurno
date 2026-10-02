// Consentimiento de cookies/datos (RGPD). Se guarda en localStorage porque la
// sesión de Supabase NO debe usarse para preferencias de tracking.
const CLAVE = "optiturno_consentimiento";
export type Consentimiento = "aceptadas" | "rechazadas";

export function leerConsentimiento(): Consentimiento | null {
  const valor = localStorage.getItem(CLAVE);
  return valor === "aceptadas" || valor === "rechazadas" ? valor : null;
}

export function guardarConsentimiento(c: Consentimiento): void {
  localStorage.setItem(CLAVE, c);
}
