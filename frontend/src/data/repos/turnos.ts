import type { BookingEvent } from "../../types";
import { initialBookings } from "../../data/index";
import type { DisponibilidadDTO } from "../../api/dto";
import { obtenerDisponibilidad, reservarTurno } from "../../api/turnos.api";
import { colorDesdeId, iconoDesdeNombre } from "../mappers";

export interface ReservarTurnoInput {
  cliente_id: string;
  profesional_id: string;
  servicio_id: string;
  fecha: string;
  hora_inicio: string;
  cliente_nombre: string;
  servicio_nombre: string;
}

export interface TurnosRepositorio {
  listarTurnos(): Promise<BookingEvent[]>;
  reservarTurno(input: ReservarTurnoInput): Promise<BookingEvent>;
  cancelarTurno(id: string): Promise<void>;
  obtenerDisponibilidad(profesionalId: string, fecha: string): Promise<DisponibilidadDTO>;
}

let cacheTurnos: BookingEvent[] | null = null;

const semillaTurnos = (): BookingEvent[] =>
  initialBookings.map((b) => ({ ...b }));

export const turnosRepositorioMock: TurnosRepositorio = {
  async listarTurnos() {
    if (!cacheTurnos) cacheTurnos = semillaTurnos();
    return cacheTurnos;
  },
  async reservarTurno(input) {
    const finish = new Date(`1970-01-01T${input.hora_inicio}:00`);
    finish.setMinutes(finish.getMinutes() + 45);
    const nuevo: BookingEvent = {
      id: crypto.randomUUID(),
      clientName: input.cliente_nombre,
      serviceName: input.servicio_nombre,
      timeStart: input.hora_inicio,
      timeEnd: finish.toTimeString().slice(0, 5),
      columnId: input.profesional_id,
      color: colorDesdeId(input.profesional_id),
      icon: iconoDesdeNombre(input.servicio_nombre),
    };
    cacheTurnos = [nuevo, ...(cacheTurnos || semillaTurnos())];
    return nuevo;
  },
  async cancelarTurno(id) {
    cacheTurnos = (cacheTurnos || semillaTurnos()).filter((b) => b.id !== id);
  },
  async obtenerDisponibilidad(profesionalId) {
    const fin = (hora: string) => {
      const d = new Date(`1970-01-01T${hora}:00`);
      d.setMinutes(d.getMinutes() + 30);
      return d.toTimeString().slice(0, 5);
    };
    return {
      fecha: new Date().toISOString().slice(0, 10),
      jornadaLaboral: { inicio: "09:00", fin: "18:00" },
      bloquesOcupados: [
        { hora_inicio: "10:00", hora_fin: fin("10:00") },
        { hora_inicio: "12:00", hora_fin: fin("12:00") },
        { hora_inicio: "14:00", hora_fin: fin("14:00") },
      ],
    };
  },
};

export const turnosRepositorioApi: TurnosRepositorio = {
  async listarTurnos() {
    throw new Error(
      "El endpoint de listado de turnos aún no está disponible en el backend.",
    );
  },
  async reservarTurno(input) {
    await reservarTurno({
      cliente_id: input.cliente_id,
      profesional_id: input.profesional_id,
      servicio_id: input.servicio_id,
      fecha: input.fecha,
      hora_inicio: input.hora_inicio,
    });
    const nuevo: BookingEvent = {
      id: crypto.randomUUID(),
      clientName: input.cliente_nombre,
      serviceName: input.servicio_nombre,
      timeStart: input.hora_inicio,
      timeEnd: "", // el backend no devuelve hora_fin en la reserva aún
      columnId: input.profesional_id,
      color: colorDesdeId(input.profesional_id),
      icon: iconoDesdeNombre(input.servicio_nombre),
    };
    return nuevo;
  },
  async cancelarTurno() {
    throw new Error(
      "El endpoint de cancelación de turnos aún no está disponible en el backend.",
    );
  },
  async obtenerDisponibilidad(profesionalId, fecha) {
    return obtenerDisponibilidad(profesionalId, fecha);
  },
};