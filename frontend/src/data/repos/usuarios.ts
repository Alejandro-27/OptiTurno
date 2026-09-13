import type { EditarUsuarioInputDTO, UsuarioAdminDTO } from "../../api/dto";
import { ROLES_SISTEMA } from "../../types/enums";
import {
  editarUsuario as editarUsuarioApi,
  listarUsuarios as listarUsuariosApi,
} from "../../api/usuarios.api";

export interface UsuariosRepositorio {
  listarUsuarios(): Promise<UsuarioAdminDTO[]>;
  editarUsuario(
    id: string,
    datos: EditarUsuarioInputDTO,
  ): Promise<UsuarioAdminDTO>;
}

// Cuentas demo en memoria (modo demo). Compartidas con el mock de auth.
export const usuariosMock: UsuarioAdminDTO[] = [
  {
    id: "usr-demo-001",
    nombre: "Administrador Demo",
    email: "admin@optiturno.com",
    rol: "superadmin",
    telefono: null,
  },
  {
    id: "usr-1102",
    nombre: "Carlos Méndez",
    email: "empleado@optiturno.com",
    rol: "empleado",
    telefono: null,
  },
  {
    id: "usr-1104",
    nombre: "Cliente Demo",
    email: "cliente@optiturno.com",
    rol: "cliente",
    telefono: null,
  },
];

// El mock de auth agrega aquí las cuentas registradas en la sesión del navegador
export const agregarUsuarioMock = (usuario: UsuarioAdminDTO): void => {
  if (!usuariosMock.some((u) => u.id === usuario.id)) {
    usuariosMock.push(usuario);
  }
};

export const usuariosRepositorioMock: UsuariosRepositorio = {
  async listarUsuarios() {
    return usuariosMock.map((u) => ({ ...u }));
  },
  async editarUsuario(id, datos) {
    const indice = usuariosMock.findIndex((u) => u.id === id);
    if (indice === -1) throw new Error("El usuario no existe.");

    const email =
      datos.email !== undefined
        ? datos.email.trim().toLowerCase()
        : usuariosMock[indice].email;
    if (!email) throw new Error("El correo no puede estar vacío.");
    if (usuariosMock.some((u) => u.id !== id && u.email === email)) {
      throw new Error("El correo ya está en uso por otro usuario.");
    }

    const rol = datos.rol !== undefined ? datos.rol : usuariosMock[indice].rol;
    if (!ROLES_SISTEMA.includes(rol)) {
      throw new Error("El rol indicado no es válido.");
    }

    usuariosMock[indice] = { ...usuariosMock[indice], email, rol };
    return { ...usuariosMock[indice] };
  },
};

export const usuariosRepositorioApi: UsuariosRepositorio = {
  async listarUsuarios() {
    return listarUsuariosApi();
  },
  async editarUsuario(id, datos) {
    return editarUsuarioApi(id, datos);
  },
};
