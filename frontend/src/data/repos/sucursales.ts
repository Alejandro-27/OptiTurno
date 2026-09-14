import type { SucursalDTO } from "../../api/dto";
import { obtenerSucursales, obtenerMiSucursal } from "../../api/negocios.api";
import { getSessionToken } from "../session";

export interface SucursalesRepositorio {
  listarSucursales(): Promise<SucursalDTO[]>;
  // Resuelve la sucursal del usuario (mi-sucursal si hay token; la primera si no)
  obtenerSucursalActiva(): Promise<SucursalDTO | null>;
}

const SUCURSAL_PRINCIPAL: SucursalDTO = {
  id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
  negocio_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  nombre: "Sede Central Anapoima",
  direccion: "Calle 4 #5-12",
  telefono: "3101234567",
  negocios: { nombre: "Barbería El Elegante" },
};

export const sucursalesRepositorioMock: SucursalesRepositorio = {
  async listarSucursales() {
    return [{ ...SUCURSAL_PRINCIPAL }];
  },
  async obtenerSucursalActiva() {
    return { ...SUCURSAL_PRINCIPAL };
  },
};

export const sucursalesRepositorioApi: SucursalesRepositorio = {
  async listarSucursales() {
    return obtenerSucursales();
  },
  async obtenerSucursalActiva() {
    const autenticado = Boolean(getSessionToken());
    if (autenticado) {
      try {
        return await obtenerMiSucursal();
      } catch {
        // si la cuenta no está enlazada a una sucursal, cae a la primera
      }
    }
    const sucursales = await obtenerSucursales();
    return sucursales[0] || null;
  },
};
