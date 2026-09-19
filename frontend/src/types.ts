export interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: number;
  status: "Activo" | "Pausado";
  icon: string;
  sucursalId?: string;
}

export interface BookingEvent {
  id: string;
  clientName: string;
  serviceName: string;
  timeStart: string; // "08:00" etc
  timeEnd: string;
  columnId: string; // "carlos", "elena" etc
  color: "primary" | "secondary" | "tertiary";
  icon: string;
  // Datos extendidos del turno (desde la API): permiten filtrar por día/estado
  // y nutrir el modal de edición desde el Calendario Maestro.
  fecha?: string;
  estado?: string;
  precio?: number;
  duracionMin?: number;
  telefono?: string | null;
  profesionalNombre?: string;
  motivoCancelacion?: string | null;
  canceladoPor?: string | null;
}

export interface ActivityLog {
  id: string;
  timeSpan: string;
  icon: string;
  iconColor: string;
  title: string;
  detail: string;
  opacity?: boolean;
}

export interface DayAvailability {
  day: string;
  enabled: boolean;
  openTime: string;
  closeTime: string;
  restStart: string;
  restEnd: string;
}

export interface Profesional {
  id: string;
  nombre: string;
  especialidad: string;
  usuarioId: string;
  email?: string;
}
