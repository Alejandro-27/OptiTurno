import { lazy, Suspense, useEffect, type ReactNode } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import ToastContainer from "./components/ToastContainer";
import RealtimeSync from "./components/RealtimeSync";
import NotFound from "./components/NotFound";
import { ToastProvider } from "./contexts/toast";
import { PRIVACIDAD, TERMINOS, COOKIES, AVISO_LEGAL } from "./data/legal";
import { iniciarApp, useStore } from "./store";
import { useSEO } from "./hooks/useSEO";
import { initAnalytics, trackPageView } from "./utils/analytics";

const Landing = lazy(() => import("./components/Landing"));
const PaginaLegal = lazy(() => import("./components/PaginaLegal"));
const CookieBanner = lazy(() => import("./components/CookieBanner"));
const ClientShell = lazy(() => import("./components/ClientShell"));
const ClientPwa = lazy(() => import("./components/ClientPwa"));
const MisTurnosView = lazy(() => import("./components/MisTurnosView"));
const MiPerfilView = lazy(() => import("./components/MiPerfilView"));
const ConfirmacionView = lazy(() => import("./components/ConfirmacionView"));
const PaginaCliente = lazy(() => import("./components/PaginaCliente"));
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
const AdminCalendar = lazy(() => import("./components/AdminCalendar"));
const AdminCatalog = lazy(() => import("./components/AdminCatalog"));
const AdminAvailability = lazy(() => import("./components/AdminAvailability"));
const AdminProfile = lazy(() => import("./components/AdminProfile"));
const AdminTeam = lazy(() => import("./components/AdminTeam"));
const AdminUsers = lazy(() => import("./components/AdminUsers"));

const RUTA_DE_TAB: Record<string, string> = {
  dashboard: "/admin",
  calendar: "/admin/calendario",
  catalog: "/admin/catalogo",
  team: "/admin/equipo",
  usuarios: "/admin/usuarios",
  availability: "/admin/disponibilidad",
  profile: "/admin/perfil",
};

function DashboardAdmin() {
  const navigate = useNavigate();
  return (
    <AdminDashboard
      onNavigate={(tab) => navigate(RUTA_DE_TAB[tab] || "/admin")}
    />
  );
}

function SoloNoEmpleado({ children }: { children: ReactNode }) {
  const esEmpleado = useStore((s) => s.sesion?.usuario.rol === "empleado");
  return esEmpleado ? <Navigate to="/admin" replace /> : children;
}

function SoloSuperadmin({ children }: { children: ReactNode }) {
  const esSuperadmin = useStore((s) => s.sesion?.usuario.rol === "superadmin");
  return esSuperadmin ? children : <Navigate to="/admin" replace />;
}

export default function App() {
  const { pathname } = useLocation();

  // SEO dinámico + telemetría (GA4 silencioso en localhost / sin var configurada)
  useSEO(pathname);
  useEffect(() => {
    initAnalytics();
  }, []);
  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  useEffect(() => {
    iniciarApp().catch(() => undefined);
  }, []);

  return (
    <ToastProvider>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-xs focus:font-bold focus:text-white"
      >
        Saltar al contenido
      </a>
      <Suspense
        fallback={
          <div className="flex min-h-dvh items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Cargando OptiTurno...
              </p>
            </div>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Landing />} />

          {/* Páginas legales (son públicas: fuera de los shells con Auth) */}
          <Route
            path="/privacidad"
            element={<PaginaLegal contenido={PRIVACIDAD} />}
          />
          <Route
            path="/terminos"
            element={<PaginaLegal contenido={TERMINOS} />}
          />
          <Route
            path="/cookies"
            element={<PaginaLegal contenido={COOKIES} />}
          />
          <Route
            path="/aviso-legal"
            element={<PaginaLegal contenido={AVISO_LEGAL} />}
          />

          {/* PWA Cliente */}
          <Route element={<ClientShell />}>
            <Route
              path="/reservar"
              element={
                <PaginaCliente
                  titulo="Reservar una Cita"
                  subtitulo="Explora los servicios disponibles y agenda tu horario preferido."
                >
                  <ClientPwa />
                </PaginaCliente>
              }
            />
            <Route
              path="/turnos"
              element={
                <PaginaCliente
                  titulo="Mis Turnos"
                  subtitulo="Historial de tus reservas y cancelaciones."
                >
                  <MisTurnosView />
                </PaginaCliente>
              }
            />
            <Route
              path="/perfil"
              element={
                <PaginaCliente
                  titulo="Mi Perfil"
                  subtitulo="Actualiza tus datos de contacto para recibir tus recordatorios."
                >
                  <MiPerfilView />
                </PaginaCliente>
              }
            />
            <Route path="/confirmacion" element={<ConfirmacionView />} />
          </Route>

          {/* Panel Admin */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardAdmin />} />
            <Route path="calendario" element={<AdminCalendar />} />
            <Route
              path="catalogo"
              element={
                <SoloNoEmpleado>
                  <AdminCatalog />
                </SoloNoEmpleado>
              }
            />
            <Route
              path="equipo"
              element={
                <SoloNoEmpleado>
                  <AdminTeam />
                </SoloNoEmpleado>
              }
            />
            <Route
              path="usuarios"
              element={
                <SoloSuperadmin>
                  <AdminUsers />
                </SoloSuperadmin>
              }
            />
            <Route path="disponibilidad" element={<AdminAvailability />} />
            <Route
              path="perfil"
              element={
                <SoloNoEmpleado>
                  <AdminProfile />
                </SoloNoEmpleado>
              }
            />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      <ToastContainer />
      <RealtimeSync />
      <CookieBanner />
    </ToastProvider>
  );
}
