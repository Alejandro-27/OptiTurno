import type { Service } from "../../types";
import { initialServices } from "../../data/index";
import { obtenerServicios } from "../../api/negocios.api";
import { servicioDtoToUI } from "../mappers";

export interface ServiciosRepositorio {
  listarServicios(sucursalId?: string): Promise<Service[]>;
  crearServicio(svc: Omit<Service, "id">): Promise<Service>;
  actualizarServicio(svc: Service): Promise<Service>;
  eliminarServicio(id: string): Promise<void>;
}

let cacheServicios: Service[] | null = null;

const semillaServicios = (): Service[] =>
  initialServices.map((s) => ({ ...s }));

export const serviciosRepositorioMock: ServiciosRepositorio = {
  async listarServicios() {
    if (!cacheServicios) cacheServicios = semillaServicios();
    return cacheServicios;
  },
  async crearServicio(svc) {
    const nuevo: Service = { ...svc, id: crypto.randomUUID() };
    cacheServicios = [nuevo, ...(cacheServicios || semillaServicios())];
    return nuevo;
  },
  async actualizarServicio(svc) {
    cacheServicios = (cacheServicios || semillaServicios()).map((s) =>
      s.id === svc.id ? { ...svc } : s,
    );
    return svc;
  },
  async eliminarServicio(id) {
    cacheServicios = (cacheServicios || semillaServicios()).filter(
      (s) => s.id !== id,
    );
  },
};

export const serviciosRepositorioApi: ServiciosRepositorio = {
  async listarServicios(sucursalId) {
    if (!sucursalId) {
      throw new Error("Se requiere el id de la sucursal para listar servicios.");
    }
    const dtos = await obtenerServicios(sucursalId);
    return dtos.map(servicioDtoToUI);
  },
  async crearServicio() {
    throw new Error(
      "El endpoint de creación de servicios aún no está disponible en el backend.",
    );
  },
  async actualizarServicio() {
    throw new Error(
      "El endpoint de actualización de servicios aún no está disponible en el backend.",
    );
  },
  async eliminarServicio() {
    throw new Error(
      "El endpoint de eliminación de servicios aún no está disponible en el backend.",
    );
  },
};