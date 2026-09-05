import type { BookingEvent } from "../../types";
import { initialBookings } from "../../data/index";
import type { DisponibilidadDTO, MisTurnoDTO } from "../../api/dto";
import { obtenerDisponibilidad, reservarTurno, obtenerMisTurnos, cancelarTurno as cancelarTurnoApi } from "../../api/turnos.api";
import { colorDesdeId, iconoDesdeNombre } from "../mappers";

export interface ReservarTurnoInput {
  cliente_id: string;
  profesional_id: string;
  servicio_id: string;
  fecha: string;
  hora_inicio: string;
  cliente_nombre: string;
  servicio_nombre: string;
  servicio_precio?: number;
}

export interface PagoRequerido {
  monto: number;
  clientSecret: string;
  transaccionId: string;
}

export interface ReservarTurnoResultado {
  turno: BookingEvent;
  pagoRequerido: PagoRequerido;
}

export interface TurnosRepositorio {
  listarTurnos(): Promise<BookingEvent[]>;
  reservarTurno(input: ReservarTurnoInput): Promise<ReservarTurnoResultado>;
  cancelarTurno(id: string): Promise<void>;
  obtenerDisponibilidad(profesionalId: string, fecha: string): Promise<DisponibilidadDTO>;
  listarMisTurnos(clienteId: string): Promise<MisTurnoDTO[]>;
  cancelarTurnoCliente(id: string): Promise<MisTurnoDTO>;
}

let cacheTurnos: BookingEvent[] | null = null;

const semillaTurnos = (): BookingEvent[] =>
  initialBookings.map((b) => ({ ...b }));

// Turnos del cliente en memoria (modo demo)
let cacheMisTurnos: MisTurnoDTO[] | null = null;

const semillaMisTurnos = (): MisTurnoDTO[] => [
  {
    id: "mis-0001",
    fecha: new Date().toISOString().slice(0, 10),
    hora_inicio: "10:00:00",
    hora_fin: "10:45:00",
    estado: "pendiente_pago",
    created_at: new Date().toISOString(),
    servicios: { nombre: "Corte Clásico", precio: 30000, duracion_minutos: 45 },
    profesionales: { id: "elena", especialidad: "Barbería", usuarios: { nombre: "Elena Ríos" } },
  },
  {
    id: "mis-0002",
    fecha: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    hora_inicio: "14:30:00",
    hora_fin: "15:00:00",
    estado: "confirmado",
    created_at: new Date().toISOString(),
    servicios: { nombre: "Afeitado Clásico", precio: 18000, duracion_minutos: 30 },
    profesionales: { id: "carlos", especialidad: "Estilismo", usuarios: { nombre: "Carlos Méndez" } },
  },
];

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
    const monto = (input.servicio_precio ?? 30000) * 0.5;
    return {
      turno: nuevo,
      pagoRequerido: {
        monto,
        clientSecret: `secret_pi_simulada_${Math.random().toString(36).slice(2, 11)}`,
        transaccionId: `pi_simulada_${Math.random().toString(36).slice(2, 11)}`,
      },
    };
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
  async listarMisTurnos() {
    if (!cacheMisTurnos) cacheMisTurnos = semillaMisTurnos();
    return cacheMisTurnos;
  },
  async cancelarTurnoCliente(id) {
    const turnos = await this.listarMisTurnos();
    const turno = turnos.find((t) => t.id === id);
    if (!turno) throw new Error("El turno no existe.");
    if (turno.estado === "cancelado") {
      throw new Error("El turno ya se encuentra cancelado.");
    }
    turno.estado = "cancelado";
    return turno;
  },
};

export const turnosRepositorioApi: TurnosRepositorio = {
  async listarTurnos() {
    throw new Error(
      "El endpoint de listado de turnos aún no está disponible en el backend.",
    );
  },
  async reservarTurno(input) {
    const resp = await reservarTurno({
      cliente_id: input.cliente_id,
      profesional_id: input.profesional_id,
      servicio_id: input.servicio_id,
      fecha: input.fecha,
      hora_inicio: input.hora_inicio,
    });
    const turnoBackend = resp.turno;
    const nuevo: BookingEvent = {
      id: turnoBackend.id,
      clientName: input.cliente_nombre,
      serviceName: input.servicio_nombre,
      timeStart: turnoBackend.hora_inicio,
      timeEnd: turnoBackend.hora_fin,
      columnId: input.profesional_id,
      color: colorDesdeId(input.profesional_id),
      icon: iconoDesdeNombre(input.servicio_nombre),
    };
    return {
      turno: nuevo,
      pagoRequerido: turnoBackend.pagoRequerido || {
        monto: (input.servicio_precio ?? 0) * 0.5,
        clientSecret: "",
        transaccionId: "",
      },
    };
  },
  async cancelarTurno() {
    throw new Error(
      "El endpoint de cancelación de turnos aún no está disponible en el backend.",
    );
  },
  async obtenerDisponibilidad(profesionalId, fecha) {
    return obtenerDisponibilidad(profesionalId, fecha);
  },
  async listarMisTurnos() {
    return obtenerMisTurnos();
  },
  async cancelarTurnoCliente(id) {
    return cancelarTurnoApi(id);
  },
};