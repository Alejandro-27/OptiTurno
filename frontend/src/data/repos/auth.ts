import type { SesionDTO } from "../../api/dto";
import { setSessionToken, getSessionToken } from "../session";
import { env } from "../../config/env";

export interface AuthRepositorio {
  login(email: string, password: string): Promise<SesionDTO>;
  logout(): Promise<void>;
  recuperarSesion(): Promise<SesionDTO | null>;
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
};

export const authRepositorioMock: AuthRepositorio = {
  async login(email, password) {
    // CREDENCIALES DE PRUEBA: admin@optiturno.com / password123
    if (
      email.trim().toLowerCase() === USUARIO_DEMO.email &&
      password === USUARIO_DEMO.password
    ) {
      const sesion: SesionDTO = {
        token: "TOKEN_SIMULADO_SUPERADMIN",
        usuario: { ...USUARIO_DEMO_DTO },
      };
      setSessionToken(sesion.token);
      return sesion;
    }
    throw new Error(
      "Credenciales inválidas. Usa admin@optiturno.com / password123 en este demo.",
    );
  },
  async logout() {
    setSessionToken(null);
  },
  async recuperarSesion() {
    return null;
  },
};

export const authRepositorioApi: AuthRepositorio = {
  async login(email, password) {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      throw new Error(
        "Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY para usar el login real.",
      );
    }
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw new Error(error.message);
    const token = data.session?.access_token;
    if (!token) throw new Error("No se recibió sesión desde Supabase.");
    const sesion: SesionDTO = {
      token,
      usuario: {
        id: data.user.id,
        email: data.user.email || email,
        nombre: data.user.user_metadata?.nombre || email,
        rol: data.user.user_metadata?.rol || "usuario",
      },
    };
    setSessionToken(token);
    return sesion;
  },
  async logout() {
    setSessionToken(null);
    try {
      const { createClient } = await import("@supabase/supabase-js");
      if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
        await supabase.auth.signOut();
      }
    } catch {
      // sin sesión remota activa
    }
  },
  async recuperarSesion() {
    const token = getSessionToken();
    if (token) {
      return {
        token,
        usuario: {
          id: "sesion-persistida",
          email: "admin@optiturno.com",
          nombre: "Administrador",
          rol: "superadmin",
        },
      };
    }
    return null;
  },
};