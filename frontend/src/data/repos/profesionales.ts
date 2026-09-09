import type { Profesional } from "../../types";
import { obtenerProfesionales } from "../../api/negocios.api";
import {
  crearProfesional as crearProfesionalApi,
  editarProfesional as editarProfesionalApi,
  eliminarProfesional as eliminarProfesionalApi,
  type CrearProfesionalInput,
  type EditarProfesionalInput,
} from "../../api/profesionales.api";
import { profesionalDtoToUI } from "../mappers";

export interface DatosCrearProfesional {
  nombre: string;
  email: string;
  especialidad?: string;
  telefono?: string;
}

export interface DatosEditarProfesional {
  nombre?: string;
  especialidad?: string;
  telefono?: string;
}

export interface ProfesionalesRepositorio {
  listarProfesionales(sucursalId?: string): Promise<Profesional[]>;
  crearProfesional(
    datos: DatosCrearProfesional,
    sucursalId?: string,
  ): Promise<Profesional>;
  editarProfesional(
    id: string,
    datos: DatosEditarProfesional,
  ): Promise<Profesional>;
  eliminarProfesional(id: string): Promise<void>;
}

const profesionalesMock: Profesional[] = [
  {
    id: "elena",
    nombre: "Elena Ríos",
    especialidad: "Barbería y Estilismo",
    usuarioId: "usr-1101",
    email: "elena@demo.com",
  },
  {
    id: "carlos",
    nombre: "Carlos Méndez",
    especialidad: "Cortes clásicos y degradados",
    usuarioId: "usr-1102",
    email: "carlos@demo.com",
  },
  {
    id: "andres",
    nombre: "Andrés Barbero",
    especialidad: "Barba y arreglo facial",
    usuarioId: "usr-1103",
    email: "andres@demo.com",
  },
];

export const profesionalesRepositorioMock: ProfesionalesRepositorio = {
  async listarProfesionales() {
    return profesionalesMock.map((p) => ({ ...p }));
  },
  async crearProfesional(datos, _sucursalId) {
    const nuevo: Profesional = {
      id: `prof-${Math.random().toString(36).slice(2, 10)}`,
      nombre: datos.nombre,
      especialidad: datos.especialidad || "General",
      usuarioId: `usr-${Math.random().toString(36).slice(2, 10)}`,
      email: datos.email,
    };
    profesionalesMock.push(nuevo);
    return { ...nuevo };
  },
  async editarProfesional(id, datos) {
    const indice = profesionalesMock.findIndex((p) => p.id === id);
    if (indice === -1) throw new Error("El profesional no existe.");
    const actualizado: Profesional = {
      ...profesionalesMock[indice],
      nombre: datos.nombre ?? profesionalesMock[indice].nombre,
      especialidad: datos.especialidad ?? profesionalesMock[indice].especialidad,
    };
    profesionalesMock[indice] = actualizado;
    return { ...actualizado };
  },
  async eliminarProfesional(id) {
    const indice = profesionalesMock.findIndex((p) => p.id === id);
    if (indice === -1) throw new Error("El profesional no existe.");
    profesionalesMock.splice(indice, 1);
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
  async crearProfesional(datos, sucursalId) {
    if (!sucursalId) {
      throw new Error(
        "Aún no hay una sucursal activa. Crea o selecciona una sucursal primero.",
      );
    }
    const input: CrearProfesionalInput = {
      sucursal_id: sucursalId,
      nombre: datos.nombre,
      email: datos.email,
      especialidad: datos.especialidad,
      telefono: datos.telefono,
    };
    const dto = await crearProfesionalApi(input);
    return profesionalDtoToUI(dto);
  },
  async editarProfesional(id, datos) {
    const input: EditarProfesionalInput = {
      nombre: datos.nombre,
      especialidad: datos.especialidad,
      telefono: datos.telefono,
    };
    const dto = await editarProfesionalApi(id, input);
    return profesionalDtoToUI(dto);
  },
  async eliminarProfesional(id) {
    await eliminarProfesionalApi(id);
  },
};