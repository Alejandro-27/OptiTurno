import { loadStripe } from "@stripe/stripe-js";
import { env, MODO_DEMO } from "../config/env";

let stripePromise: ReturnType<typeof loadStripe> | null = null;

// Carga lazy de Stripe.js. En modo demo no hay integración real, no cargamos el SDK.
export const obtenerStripe = () => {
  if (MODO_DEMO) return null;
  if (!env.STRIPE_PK) {
    console.warn("Falta VITE_STRIPE_PK en el entorno para procesar pagos reales.");
    return null;
  }
  if (!stripePromise) {
    stripePromise = loadStripe(env.STRIPE_PK);
  }
  return stripePromise;
};