const CLAVE = "optiturno_ultimo_turno";

export interface ResumenTurnoReservado {
  servicioNombre: string;
  servicioPrecio?: number;
  servicioDuracion?: number;
  profesionalNombre: string;
  hora: string;
  fecha: string;
  fechaISO: string;
  horaInicio: string;
}

// Respaldo de la página de confirmación: sobrevive al refresh y no depende de
// location.state (que se pierde al recargar). No es datos de sesión: no usa
// localStorage ni las claves de auth de frontend/src/data/session.ts.
export function guardarUltimoTurno(resumen: ResumenTurnoReservado): void {
  sessionStorage.setItem(CLAVE, JSON.stringify(resumen));
}

export function leerUltimoTurno(): ResumenTurnoReservado | null {
  const crudo = sessionStorage.getItem(CLAVE);
  if (!crudo) return null;
  try {
    return JSON.parse(crudo) as ResumenTurnoReservado;
  } catch {
    return null;
  }
}

export function limpiarUltimoTurno(): void {
  sessionStorage.removeItem(CLAVE);
}
