import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error(
    "Falta STRIPE_SECRET_KEY en el entorno. Configúrala en backend/.env",
  );
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: Stripe.API_VERSION as Stripe.LatestApiVersion,
  typescript: true,
  appInfo: { name: "OptiTurno", version: "1.0.0" },
});