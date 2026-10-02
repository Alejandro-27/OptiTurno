import { env } from "../config/env";
import { leerConsentimiento } from "./consentimiento";

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

// Carga el snippet de Google Analytics 4 (gtag). Silencioso en localhost, sin
// VITE_GA_MEASUREMENT_ID (ver AGENTS raíz, regla de secretos) o si el usuario
// aún no aceptó la política de cookies (RGPD). Reintentar tras aceptar: llamar
// a activarAnalitica().
export function initAnalytics(): void {
  if (inicializado) return;
  if (!env.GA_MEASUREMENT_ID || esLocal()) return;
  if (leerConsentimiento() !== "aceptadas") return;

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

// Llámala tras aceptar la política de cookies para habilitar GA4 en la misma
// sesión (initAnalytics no vuelve a tocar gtag si ya quedó inicializado).
export function activarAnalitica(): void {
  if (inicializado) return;
  initAnalytics();
  trackPageView(window.location.pathname);
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
