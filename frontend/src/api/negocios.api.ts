import { apiClient } from "./api.client";

export interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion_minutos: number;
}

export interface Profesional {
  id: string;
  especialidad: string;
  usuarios: {
    id: string;
    nombre: string;
    email: string;
  };
}

interface SeederResponse {
  mensaje: string;
  negocioId: string;
  sucursalId: string;
  serviciosInsertados: number;
}

// Trae los servicios disponibles de una sucursal específica
export const obtenerServicios = async (
  sucursalId: string,
): Promise<Servicio[]> => {
  const { data } = await apiClient.get<Servicio[]>(
    `/sucursales/${sucursalId}/servicios`,
  );
  return data;
};


// Trae el personal (profesionales) de una sucursal
export const obtenerProfesionales = async (sucursalId: string): Promise<Profesional[]> => {
  const { data } = await apiClient.get<Profesional[]>(`/sucursales/${sucursalId}/profesionales`);
  return data;
};


//Disparador de emergencia para poblar la base de datos en plena exposición
export const ejecutarSeederDev = async (): Promise<SeederResponse> => {
  const { data } = await apiClient.post<SeederResponse>('/seed');
  return data;
};