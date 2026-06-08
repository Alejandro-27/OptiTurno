import { Service, BookingEvent, ActivityLog, DayAvailability } from './types';

export const initialServices: Service[] = [
  {
    id: '1',
    name: 'Corte de Cabello Signature',
    category: 'Estética Masculina',
    price: 55000,
    duration: 45,
    status: 'Activo',
    icon: 'scissors'
  },
  {
    id: '2',
    name: 'Tratamiento Facial Deep Clean',
    category: 'Cuidado de Piel',
    price: 120000,
    duration: 90,
    status: 'Activo',
    icon: 'spa'
  },
  {
    id: '3',
    name: 'Coloración y Mechas',
    category: 'Colorimetría',
    price: 210000,
    duration: 120,
    status: 'Pausado',
    icon: 'brush'
  },
  {
    id: '4',
    name: 'Perfilado de Barba',
    category: 'Estética Masculina',
    price: 35000,
    duration: 30,
    status: 'Activo',
    icon: 'face'
  }
];

export const initialBookings: BookingEvent[] = [
  {
    id: 'b1',
    clientName: 'Ricardo Quintero',
    serviceName: 'Corte Premium',
    timeStart: '08:00',
    timeEnd: '09:30',
    columnId: 'elena',
    color: 'secondary',
    icon: 'scissors'
  },
  {
    id: 'b2',
    clientName: 'Lucía Méndez',
    serviceName: 'Corte Classic',
    timeStart: '09:15',
    timeEnd: '10:00',
    columnId: 'carlos',
    color: 'primary',
    icon: 'scissors'
  },
  {
    id: 'b3',
    clientName: 'Juan Pablo',
    serviceName: 'Barba',
    timeStart: '09:00',
    timeEnd: '10:30',
    columnId: 'marco',
    color: 'tertiary',
    icon: 'face'
  },
  {
    id: 'b4',
    clientName: 'Carlos Ferro',
    serviceName: 'Tratamiento',
    timeStart: '10:00',
    timeEnd: '10:45',
    columnId: 'elena',
    color: 'secondary',
    icon: 'spa'
  },
  {
    id: 'b5',
    clientName: 'Marta Sánchez',
    serviceName: 'Manicura',
    timeStart: '10:15',
    timeEnd: '11:00',
    columnId: 'sofia',
    color: 'primary',
    icon: 'brush'
  }
];

export const initialActivityLogs: ActivityLog[] = [
  {
    id: 'l1',
    timeSpan: 'Hace 2m',
    icon: 'clock',
    iconColor: 'text-indigo-400',
    title: 'Nueva Cita',
    detail: 'Juan Pérez - Corte Premium + Barba'
  },
  {
    id: 'l2',
    timeSpan: 'Hace 5m',
    icon: 'check-circle-2',
    iconColor: 'text-emerald-400',
    title: 'Pago Procesado',
    detail: '$85.000 COP | ID: #ORD-9821'
  },
  {
    id: 'l3',
    timeSpan: 'Hace 12m',
    icon: 'alert-triangle',
    iconColor: 'text-amber-500',
    title: 'No-Show detectado',
    detail: 'Reserva: 14:30 - Carlos G. (Sala 2)'
  },
  {
    id: 'l4',
    timeSpan: 'Hace 18m',
    icon: 'user-plus',
    iconColor: 'text-indigo-400',
    title: 'Nuevo Registro',
    detail: 'Elena Gomez se unió vía QR Tools.'
  },
  {
    id: 'l5',
    timeSpan: 'Hace 25m',
    icon: 'mail',
    iconColor: 'text-gray-400',
    title: 'Newsletter enviada',
    detail: 'Campaña: "Promo Verano" (450 correos)',
    opacity: true
  }
];

export const defaultAvailability: DayAvailability[] = [
  { day: 'Lunes', enabled: true, openTime: '09:00', closeTime: '18:00', restStart: '13:00', restEnd: '14:00' },
  { day: 'Martes', enabled: true, openTime: '09:00', closeTime: '18:00', restStart: '13:00', restEnd: '14:00' },
  { day: 'Miércoles', enabled: true, openTime: '09:00', closeTime: '18:00', restStart: '13:00', restEnd: '14:00' },
  { day: 'Jueves', enabled: true, openTime: '09:00', closeTime: '18:00', restStart: '13:00', restEnd: '14:00' },
  { day: 'Viernes', enabled: true, openTime: '09:00', closeTime: '18:00', restStart: '13:00', restEnd: '14:00' },
  { day: 'Sábado', enabled: false, openTime: '09:00', closeTime: '14:00', restStart: '12:00', restEnd: '13:00' },
  { day: 'Domingo', enabled: false, openTime: '09:00', closeTime: '14:00', restStart: '12:00', restEnd: '13:00' }
];
