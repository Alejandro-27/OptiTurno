const CLAVE_TOKEN = "optiturno_token";

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