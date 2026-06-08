export interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: number;
  status: 'Activo' | 'Pausado';
  icon: string;
}

export interface BookingEvent {
  id: string;
  clientName: string;
  serviceName: string;
  timeStart: string; // "08:00" etc
  timeEnd: string;
  columnId: string; // "carlos", "elena" etc
  color: 'primary' | 'secondary' | 'tertiary';
  icon: string;
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
