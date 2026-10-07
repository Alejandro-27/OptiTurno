import type {
  NegocioAdminDTO,
  SucursalAdminDTO,
  CrearNegocioInputDTO,
  ActualizarNegocioInputDTO,
  CrearSucursalInputDTO,
  ActualizarSucursalInputDTO,
} from "../../api/dto";
import {
  listarNegocios as listarNegociosApi,
  crearNegocio as crearNegocioApi,
  actualizarNegocio as actualizarNegocioApi,
  eliminarNegocio as eliminarNegocioApi,
  crearSucursal as crearSucursalApi,
  actualizarSucursal as actualizarSucursalApi,
  eliminarSucursal as eliminarSucursalApi,
  listarUsuariosNegocio as listarUsuariosNegocioApi,
} from "../../api/negocios.api";

export interface NegociosRepositorio {
  listarNegocios(): Promise<NegocioAdminDTO[]>;
  crearNegocio(input: CrearNegocioInputDTO): Promise<NegocioAdminDTO>;
  actualizarNegocio(
    id: string,
    input: ActualizarNegocioInputDTO,
  ): Promise<NegocioAdminDTO>;
  eliminarNegocio(id: string): Promise<void>;
  crearSucursal(input: CrearSucursalInputDTO): Promise<SucursalAdminDTO>;
  actualizarSucursal(
    id: string,
    input: ActualizarSucursalInputDTO,
  ): Promise<SucursalAdminDTO>;
  eliminarSucursal(id: string): Promise<void>;
  listarUsuariosNegocio(
    negocioId: string,
  ): Promise<Array<{ id: string; nombre: string; email: string; rol: string }>>;
}

const NEGOCIOS_MOCK: NegocioAdminDTO[] = [
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    nombre: "Barbería El Elegante",
    slug: "barberia-el-elegante",
    activo: true,
    admin_usuario_id: "11111111-1111-1111-1111-111111111111",
    sucursales: [
      {
        id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        negocio_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        nombre: "Sede Central Anapoima",
        direccion: "Calle 4 #5-12",
        telefono: "3101234567",
        activo: true,
      },
      {
        id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc",
        negocio_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        nombre: "Sede Norte Bogotá",
        direccion: "Av 19 #100-20",
        telefono: "3101234568",
        activo: true,
      },
    ],
  },
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab",
    nombre: "Spa Relax & Wellness",
    slug: "spa-relax",
    activo: true,
    admin_usuario_id: null,
    sucursales: [
      {
        id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
        negocio_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab",
        nombre: "Sede Principal Chapinero",
        direccion: "Calle 67 #7-30",
        telefono: "3101234560",
        activo: true,
      },
    ],
  },
];

const uuid = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

export const negociosRepositorioMock: NegociosRepositorio = {
  async listarNegocios() {
    return NEGOCIOS_MOCK.map((n) => ({
      ...n,
      sucursales: n.sucursales.map((s) => ({ ...s })),
    }));
  },
  async crearNegocio(input) {
    const negocio: NegocioAdminDTO = {
      id: uuid(),
      nombre: input.nombre,
      slug: input.slug,
      activo: true,
      admin_usuario_id: null,
      sucursales: [],
    };
    NEGOCIOS_MOCK.push(negocio);
    return { ...negocio, sucursales: [] };
  },
  async actualizarNegocio(id, input) {
    const negocio = NEGOCIOS_MOCK.find((n) => n.id === id);
    if (!negocio) throw new Error("El negocio no existe.");
    if (input.nombre !== undefined) negocio.nombre = input.nombre;
    if (input.slug !== undefined) negocio.slug = input.slug;
    return {
      ...negocio,
      sucursales: negocio.sucursales.map((s) => ({ ...s })),
    };
  },
  async eliminarNegocio(id) {
    const negocio = NEGOCIOS_MOCK.find((n) => n.id === id);
    if (!negocio) throw new Error("El negocio no existe.");
    negocio.activo = false;
    negocio.sucursales.forEach((s) => {
      s.activo = false;
    });
  },
  async crearSucursal(input) {
    const negocio = NEGOCIOS_MOCK.find((n) => n.id === input.negocio_id);
    if (!negocio) throw new Error("El negocio no existe.");
    const sucursal: SucursalAdminDTO = {
      id: uuid(),
      negocio_id: input.negocio_id,
      nombre: input.nombre,
      direccion: input.direccion,
      telefono: input.telefono,
      activo: true,
    };
    negocio.sucursales.push(sucursal);
    return { ...sucursal };
  },
  async actualizarSucursal(id, input) {
    for (const negocio of NEGOCIOS_MOCK) {
      const sucursal = negocio.sucursales.find((s) => s.id === id);
      if (!sucursal) continue;
      if (input.nombre !== undefined) sucursal.nombre = input.nombre;
      if (input.direccion !== undefined) sucursal.direccion = input.direccion;
      if (input.telefono !== undefined) sucursal.telefono = input.telefono;
      if (input.activo !== undefined) sucursal.activo = input.activo;
      return { ...sucursal };
    }
    throw new Error("La sucursal no existe.");
  },
  async eliminarSucursal(id) {
    for (const negocio of NEGOCIOS_MOCK) {
      const sucursal = negocio.sucursales.find((s) => s.id === id);
      if (!sucursal) continue;
      sucursal.activo = false;
      return;
    }
    throw new Error("La sucursal no existe.");
  },
  async listarUsuariosNegocio() {
    return [
      {
        id: "usr-001",
        nombre: "Alejandro Vargas",
        email: "admin@optiturno.com",
        rol: "admin_negocio",
      },
      {
        id: "usr-1102",
        nombre: "Carlos Méndez",
        email: "empleado@optiturno.com",
        rol: "empleado",
      },
    ];
  },
};

export const negociosRepositorioApi: NegociosRepositorio = {
  async listarNegocios() {
    return listarNegociosApi();
  },
  async crearNegocio(input) {
    return crearNegocioApi(input);
  },
  async actualizarNegocio(id, input) {
    return actualizarNegocioApi(id, input);
  },
  async eliminarNegocio(id) {
    return eliminarNegocioApi(id);
  },
  async crearSucursal(input) {
    return crearSucursalApi(input);
  },
  async actualizarSucursal(id, input) {
    return actualizarSucursalApi(id, input);
  },
  async eliminarSucursal(id) {
    return eliminarSucursalApi(id);
  },
  async listarUsuariosNegocio(negocioId) {
    return listarUsuariosNegocioApi(negocioId);
  },
};
