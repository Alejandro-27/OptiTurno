import { supabase } from "../config/database.js";
import { stripe } from "../config/stripe.js";

interface CrearIntencionInput {
  turno_id: string;
  monto: number;
}

export const crearIntencionPagoService = async (datos: CrearIntencionInput) => {
  const { turno_id, monto } = datos;

  // Creamos el PaymentIntent real en Stripe (monto en centavos).
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(monto * 100),
    currency: "cop",
    automatic_payment_methods: { enabled: true },
    metadata: { turno_id },
  });

  if (!paymentIntent.client_secret) {
    throw { status: 500, message: "No se pudo obtener el client_secret del PaymentIntent." };
  }

  // Registrar el intento de pago en la tabla 'pagos_garantia' como 'pendiente'
  const { data: pago, error } = await supabase
    .from("pagos_garantia")
    .insert([
      {
        turno_id,
        pasarela: "stripe",
        transaccion_id: paymentIntent.id,
        monto,
        estado: "pendiente",
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return {
    clientSecret: paymentIntent.client_secret,
    pagoId: pago.id,
    transaccionId: paymentIntent.id as string,
  };
};

/**
 * Lógica que se ejecutará cuando Stripe nos confirme el pago (Webhook)
 */
export const confirmarPagoService = async (transaccionId: string) => {
  // Buscar el registro del pago de garantía
  const { data: pago, error: errorPago } = await supabase
    .from("pagos_garantia")
    .select("id, turno_id")
    .eq("transaccion_id", transaccionId)
    .single();

  if (errorPago || !pago) {
    throw { status: 404, message: "Transacción no encontrada en el sistema." };
  }

  // Actualizar el estado del pago a 'aprobado'
  await supabase
    .from("pagos_garantia")
    .update({ estado: "aprobado", updated_at: new Date().toISOString() })
    .eq("id", pago.id);

  // Confirmamos el turno en la agenda
  await supabase
    .from("turnos")
    .update({ estado: "confirmado" })
    .eq("id", pago.turno_id);

  return {
    success: true,
    message: "Turno confirmado y pago aprobado correctamente.",
  };
};