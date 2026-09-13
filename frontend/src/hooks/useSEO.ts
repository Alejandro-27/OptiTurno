import { useEffect } from "react";

interface MetadatosSEO {
  title: string;
  description: string;
}

const SEO_POR_RUTA: Record<string, MetadatosSEO> = {
  "/": {
    title:
      "OptiTurno — Agendamiento inteligente para comercios de servicios presenciales",
    description:
      "Reservá en segundos citas en barberías, estética, salud y más. Menos inasistencias, agenda digitalizada y recordatorios automáticos para clientes y comercios.",
  },
  "/reservar": {
    title: "Reservar Cita | OptiTurno",
    description:
      "Elegí tu servicio, profesional y horario preferido. Confirmación al instante y recordatorio por WhatsApp.",
  },
  "/turnos": {
    title: "Mis Turnos | OptiTurno",
    description:
      "Consultá y gestioná tus reservas: confirmalas, reprogramálas o cancelalas en un toque.",
  },
  "/perfil": {
    title: "Mi Perfil | OptiTurno",
    description:
      "Actualizá tus datos de contacto para recibir los recordatorios de tus turnos.",
  },
  "/confirmacion": {
    title: "Turno Confirmado | OptiTurno",
    description:
      "Tu cita quedó reservada. Agregala a tu calendario o llevá el ticket digital por WhatsApp.",
  },
  "/admin": {
    title: "Panel de Control | OptiTurno",
    description:
      "Dashboard, calendario maestro, catálogo y disponibilidad de tu comercio.",
  },
  "/admin/calendario": {
    title: "Calendario Maestro | OptiTurno",
    description:
      "Visualizá y gestioná todos los turnos de tu equipo en un solo calendario.",
  },
  "/admin/catalogo": {
    title: "Catálogo de Servicios | OptiTurno",
    description:
      "Administrá los servicios, precios y duraciones que ofrecés a tus clientes.",
  },
  "/admin/equipo": {
    title: "Equipo de Profesionales | OptiTurno",
    description:
      "Dadas de alta, ediciones y horarios de tu equipo de profesionales.",
  },
  "/admin/usuarios": {
    title: "Gestión de Usuarios | OptiTurno",
    description:
      "Administrá las cuentas del sistema: correos, roles y accesos de cada usuario.",
  },
  "/admin/disponibilidad": {
    title: "Disponibilidad | OptiTurno",
    description:
      "Configurá las semanas horarias laborales y el horario de cada turno.",
  },
  "/admin/perfil": {
    title: "Perfil del Comercio | OptiTurno",
    description:
      "Onboarding y personalización del portal de cliente: marca, colores y subdominio.",
  },
};

const SEO_DEFAULT: MetadatosSEO = {
  title: "OptiTurno — Agendamiento inteligente",
  description:
    "Plataforma de agendamiento inteligente para comercios de servicios presenciales.",
};

export function metadatosParaRuta(ruta: string): MetadatosSEO {
  return SEO_POR_RUTA[ruta] || SEO_DEFAULT;
}

function asignarMeta(selector: string, valor: string): void {
  const etiqueta = document.head.querySelector(selector);
  if (etiqueta) etiqueta.setAttribute("content", valor);
}

// Aplica título y meta description (normal + Open Graph/Twitter) por ruta.
export function useSEO(ruta: string): void {
  useEffect(() => {
    const seo = metadatosParaRuta(ruta);
    document.title = seo.title;
    const descripcion = seo.description;

    asignarMeta('meta[name="description"]', descripcion);
    asignarMeta('meta[property="og:title"]', seo.title);
    asignarMeta('meta[property="og:description"]', descripcion);
    asignarMeta('meta[property="twitter:title"]', seo.title);
    asignarMeta('meta[property="twitter:description"]', descripcion);
    asignarMeta('meta[property="og:url"]', window.location.href);
  }, [ruta]);
}
