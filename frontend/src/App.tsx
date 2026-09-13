import { useEffect, type ReactNode } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import AdminDashboard from "./components/AdminDashboard";
import AdminCalendar from "./components/AdminCalendar";
import AdminCatalog from "./components/AdminCatalog";
import AdminAvailability from "./components/AdminAvailability";
import AdminProfile from "./components/AdminProfile";
import AdminTeam from "./components/AdminTeam";
import AdminUsers from "./components/AdminUsers";
import ClientShell from "./components/ClientShell";
import ClientPwa from "./components/ClientPwa";
import MisTurnosView from "./components/MisTurnosView";
import MiPerfilView from "./components/MiPerfilView";
import ConfirmacionView from "./components/ConfirmacionView";
import Landing from "./components/Landing";
import NotFound from "./components/NotFound";
import PaginaCliente from "./components/PaginaCliente";
import AdminLayout from "./layouts/AdminLayout";
import ToastContainer from "./components/ToastContainer";
import { ToastProvider } from "./contexts/toast";
import { iniciarApp, useStore } from "./store";
import { useSEO } from "./hooks/useSEO";
import { initAnalytics, trackPageView } from "./utils/analytics";

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
      <Routes>
        <Route path="/" element={<Landing />} />

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

      <ToastContainer />
    </ToastProvider>
  );
}
