import { env } from "../config/env";

type GtagArgs = Array<string | number | Record<string, unknown> | Date>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: GtagArgs) => void;
  }
}

let inicializado = false;

function esLocal(): boolean {
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
}

// Carga el snippet de Google Analytics 4 (gtag). Silencioso en localhost o si
// no se configuró VITE_GA_MEASUREMENT_ID (ver AGENTS raíz, regla de secretos).
export function initAnalytics(): void {
  if (inicializado) return;
  if (!env.GA_MEASUREMENT_ID || esLocal()) return;
  inicializado = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = (...args: GtagArgs) => {
    window.dataLayer!.push(args);
  };

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${env.GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.gtag("js", new Date());
  window.gtag("config", env.GA_MEASUREMENT_ID);
}

// Registra el pageview de GA4 en cada cambio de ruta.
export function trackPageView(ruta: string): void {
  if (!inicializado || !window.gtag) return;
  window.gtag("config", env.GA_MEASUREMENT_ID, { page_path: ruta });
}

// Evento opcional para CTA's clave (ej. conversión). Silencioso si GA está off.
export function trackEvent(
  nombre: string,
  parametros?: Record<string, unknown>,
): void {
  if (!inicializado || !window.gtag) return;
  window.gtag("event", nombre, parametros);
}
