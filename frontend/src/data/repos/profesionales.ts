import type { Profesional } from "../../types";
import { obtenerProfesionales } from "../../api/negocios.api";
import { profesionalDtoToUI } from "../mappers";

export interface ProfesionalesRepositorio {
  listarProfesionales(sucursalId?: string): Promise<Profesional[]>;
}

const profesionalesMock: Profesional[] = [
  {
    id: "elena",
    nombre: "Elena Ríos",
    especialidad: "Barbería y Estilismo",
    usuarioId: "usr-1101",
  },
  {
    id: "carlos",
    nombre: "Carlos Méndez",
    especialidad: "Cortes clásicos y degradados",
    usuarioId: "usr-1102",
  },
  {
    id: "andres",
    nombre: "Andrés Barbero",
    especialidad: "Barba y arreglo facial",
    usuarioId: "usr-1103",
  },
];

export const profesionalesRepositorioMock: ProfesionalesRepositorio = {
  async listarProfesionales() {
    return profesionalesMock.map((p) => ({ ...p }));
  },
};

export const profesionalesRepositorioApi: ProfesionalesRepositorio = {
  async listarProfesionales(sucursalId) {
    if (!sucursalId) {
      throw new Error("Se requiere el id de la sucursal para listar profesionales.");
    }
    const dtos = await obtenerProfesionales(sucursalId);
    return dtos.map(profesionalDtoToUI);
  },
};