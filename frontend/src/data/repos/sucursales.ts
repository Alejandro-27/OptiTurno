import type { SucursalDTO, MiNegocioDTO } from "../../api/dto";
import {
  obtenerSucursales,
  obtenerMiSucursal,
  obtenerMiNegocio,
} from "../../api/negocios.api";
import { getSessionToken } from "../session";
import { ApiError } from "../../api/dto";

export interface SucursalesRepositorio {
  listarSucursales(): Promise<SucursalDTO[]>;
  // Resuelve la sucursal del usuario (mi-sucursal si hay token; la primera si no)
  obtenerSucursalActiva(): Promise<SucursalDTO | null>;
  // Verifica si el admin_negocio autenticado tiene negocio configurado
  obtenerMiNegocio(): Promise<MiNegocioDTO | null>;
}

const SUCURSAL_PRINCIPAL: SucursalDTO = {
  id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
  negocio_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  nombre: "Sede Central Anapoima",
  direccion: "Calle 4 #5-12",
  telefono: "3101234567",
  negocios: { nombre: "Barbería El Elegante" },
};

const NEGOCIO_PRINCIPAL: MiNegocioDTO = {
  id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  nombre: "Barbería El Elegante",
  slug: "barberia-el-elegante",
  admin_usuario_id: "11111111-1111-1111-1111-111111111111",
  sucursales: [SUCURSAL_PRINCIPAL],
};

export const sucursalesRepositorioMock: SucursalesRepositorio = {
  async listarSucursales() {
    return [{ ...SUCURSAL_PRINCIPAL }];
  },
  async obtenerSucursalActiva() {
    return { ...SUCURSAL_PRINCIPAL };
  },
  async obtenerMiNegocio() {
    // En mock, el admin_negocio de prueba SÍ tiene negocio
    return { ...NEGOCIO_PRINCIPAL };
  },
};

export const sucursalesRepositorioApi: SucursalesRepositorio = {
  async listarSucursales() {
    return obtenerSucursales();
  },
  async obtenerSucursalActiva() {
    // 1. Si viene en la URL (?sucursal= o ?negocio=), resolver esa sede puntual
    if (typeof window !== "undefined" && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const sucursalParam = params.get("sucursal");
      const negocioParam = params.get("negocio");

      if (sucursalParam || negocioParam) {
        try {
          const sucursales = await obtenerSucursales();
          const encontrada = sucursales.find(
            (s) =>
              s.id === sucursalParam ||
              s.negocio_id === negocioParam ||
              (s.negocios &&
                (s.negocios as { nombre?: string; slug?: string }).slug ===
                  negocioParam),
          );
          if (encontrada) return encontrada;
        } catch {
          // continuar con el flujo normal
        }
      }
    }

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
  async obtenerMiNegocio() {
    try {
      return await obtenerMiNegocio();
    } catch (error) {
      // 404 = no tiene negocio (requiere onboarding)
      if (error instanceof ApiError && error.estado === 404) return null;
      throw error;
    }
  },
};
