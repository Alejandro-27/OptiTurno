import type {
  RegistrarUsuarioInput,
  SesionDTO,
  UsuarioSesionDTO,
} from "../../api/dto";
import { setSessionToken, setSesionPersistida, getSesionPersistida } from "../session";
import { loginUsuario, registrarUsuario, obtenerPerfil as obtenerPerfilApi, actualizarPerfil as actualizarPerfilApi } from "../../api/usuarios.api";

export interface RegistrarCuentaInput {
  email: string;
  password: string;
  nombre: string;
  telefono?: string;
  rol?: string;
}

export interface AuthRepositorio {
  login(email: string, password: string): Promise<SesionDTO>;
  registrar(datos: RegistrarCuentaInput): Promise<SesionDTO>;
  logout(): Promise<void>;
  recuperarSesion(): Promise<SesionDTO | null>;
  obtenerPerfil(): Promise<UsuarioSesionDTO>;
  actualizarPerfil(datos: {
    nombre?: string;
    telefono?: string;
  }): Promise<UsuarioSesionDTO>;
}

const USUARIO_DEMO = {
  email: "admin@optiturno.com",
  password: "password123",
};

const USUARIO_DEMO_DTO = {
  id: "usr-demo-001",
  email: USUARIO_DEMO.email,
  nombre: "Administrador Demo",
  rol: "superadmin",
  telefono: null,
};

// Cuentas registradas en memoria durante la sesión del navegador (solo modo demo)
const cuentasRegistradas: Array<{
  email: string;
  password: string;
  id: string;
  nombre: string;
  telefono?: string;
  rol: string;
}> = [];

export const authRepositorioMock: AuthRepositorio = {
  async login(email, password) {
    const normalizado = email.trim().toLowerCase();
    if (
      normalizado === USUARIO_DEMO.email &&
      password === USUARIO_DEMO.password
    ) {
      const sesion: SesionDTO = {
        token: "TOKEN_SIMULADO_SUPERADMIN",
        usuario: { ...USUARIO_DEMO_DTO },
      };
      setSesionPersistida(sesion);
      return sesion;
    }
    const cuenta = cuentasRegistradas.find(
      (c) => c.email === normalizado && c.password === password,
    );
    if (cuenta) {
      const sesion: SesionDTO = {
        token: `TOKEN_SIMULADO_${cuenta.id}`,
        usuario: {
          id: cuenta.id,
          email: cuenta.email,
          nombre: cuenta.nombre,
          rol: cuenta.rol,
        },
      };
      setSesionPersistida(sesion);
      return sesion;
    }
    throw new Error(
      "Credenciales inválidas. Usa admin@optiturno.com / password123 o regístrate.",
    );
  },
  async registrar(datos) {
    const normalizado = datos.email.trim().toLowerCase();
    if (cuentasRegistradas.some((c) => c.email === normalizado)) {
      throw new Error("Ya existe una cuenta con ese correo.");
    }
    const id = `usr-${Math.random().toString(36).slice(2, 10)}`;
    cuentasRegistradas.push({
      email: normalizado,
      password: datos.password,
      id,
      nombre: datos.nombre,
      telefono: datos.telefono,
      rol: datos.rol || "cliente",
    });
    // El registro entra automáticamente (login implícito)
    return this.login(normalizado, datos.password);
  },
  async logout() {
    setSesionPersistida(null);
    setSessionToken(null);
  },
  async recuperarSesion() {
    return getSesionPersistida();
  },
  async obtenerPerfil() {
    const sesion = getSesionPersistida();
    if (!sesion) throw new Error("Sin sesión activa.");
    return { ...sesion.usuario };
  },
  async actualizarPerfil(datos) {
    const sesion = getSesionPersistida();
    if (!sesion) throw new Error("Sin sesión activa.");
    const perfil: UsuarioSesionDTO = {
      ...sesion.usuario,
      nombre: datos.nombre ?? sesion.usuario.nombre,
      telefono: datos.telefono ?? sesion.usuario.telefono ?? null,
    };
    setSesionPersistida({ ...sesion, usuario: perfil });
    return perfil;
  },
};

export const authRepositorioApi: AuthRepositorio = {
  async login(email, password) {
    const sesion = await loginUsuario({ email, password });
    setSesionPersistida(sesion);
    return sesion;
  },
  async registrar(datos) {
    const perfil = await registrarUsuario({
      email: datos.email,
      password: datos.password,
      nombre: datos.nombre,
      telefono: datos.telefono,
      rol: datos.rol || "cliente",
    });
    // El registro entra automáticamente (login implícito)
    const sesion = await loginUsuario({ email: datos.email, password: datos.password });
    return { token: sesion.token, usuario: perfil };
  },
  async logout() {
    setSesionPersistida(null);
    setSessionToken(null);
  },
  async recuperarSesion() {
    return getSesionPersistida();
  },
  async obtenerPerfil() {
    return obtenerPerfilApi();
  },
  async actualizarPerfil(datos) {
    return actualizarPerfilApi(datos);
  },
};