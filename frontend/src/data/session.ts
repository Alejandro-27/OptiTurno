import type { SesionDTO } from "../api/dto";

const CLAVE_TOKEN = "optiturno_token";
const CLAVE_SESION = "optiturno_sesion";

let tokenActual: string | null = (() => {
  try {
    return localStorage.getItem(CLAVE_TOKEN);
  } catch {
    return null;
  }
})();

export function getSessionToken(): string | null {
  return tokenActual;
}

export function setSessionToken(token: string | null): void {
  tokenActual = token;
  try {
    if (token) {
      localStorage.setItem(CLAVE_TOKEN, token);
    } else {
      localStorage.removeItem(CLAVE_TOKEN);
    }
  } catch {
    // almacenamiento no disponible (SSR o privacidad estricta)
  }
}

// Sesión completa persistida (token + perfil): permite restaurar la vista
// según el rol al recargar la página sin volver a iniciar sesión.
export function getSesionPersistida(): SesionDTO | null {
  try {
    const cruda = localStorage.getItem(CLAVE_SESION);
    if (!cruda) return null;
    const sesion = JSON.parse(cruda) as SesionDTO;
    if (!sesion?.token || !sesion?.usuario?.id) return null;
    return sesion;
  } catch {
    return null;
  }
}

export function setSesionPersistida(sesion: SesionDTO | null): void {
  setSessionToken(sesion?.token || null);
  try {
    if (sesion) {
      localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
    } else {
      localStorage.removeItem(CLAVE_SESION);
    }
  } catch {
    // almacenamiento no disponible
  }
}