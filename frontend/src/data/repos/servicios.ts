import type { Service } from "../../types";
import { initialServices } from "../../data/index";
import {
  obtenerServicios,
  crearServicio as crearServicioApi,
  actualizarServicio as actualizarServicioApi,
  eliminarServicio as eliminarServicioApi,
} from "../../api/negocios.api";
import { servicioDtoToUI, servicioUIToDto } from "../mappers";

export interface ServiciosRepositorio {
  listarServicios(sucursalId?: string): Promise<Service[]>;
  crearServicio(
    svc: Omit<Service, "id"> & { sucursalId?: string },
    sucursalId?: string,
  ): Promise<Service>;
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
    const nuevo: Service = {
      ...svc,
      id: crypto.randomUUID(),
      sucursalId: svc.sucursalId,
      icon: svc.icon || "scissors",
    } as Service;
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
      throw new Error(
        "Se requiere el id de la sucursal para listar servicios.",
      );
    }
    const dtos = await obtenerServicios(sucursalId);
    return dtos.map(servicioDtoToUI);
  },
  async crearServicio(svc, sucursalId) {
    const sucursal = sucursalId || svc.sucursalId;
    if (!sucursal) {
      throw new Error(
        "Aún no hay una sucursal activa. Crea o selecciona una sucursal primero.",
      );
    }
    const dto = await crearServicioApi(
      sucursal,
      servicioUIToDto(svc as Service),
    );
    return servicioDtoToUI(dto);
  },
  async actualizarServicio(svc) {
    const dto = await actualizarServicioApi(svc.id, {
      nombre: svc.name,
      descripcion: svc.category,
      precio: svc.price,
      duracion_minutos: svc.duration,
      estado: svc.status,
    });
    return servicioDtoToUI(dto);
  },
  async eliminarServicio(id) {
    await eliminarServicioApi(id);
  },
};
