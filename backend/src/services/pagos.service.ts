import { supabase } from "../config/database.js";

interface CrearIntencionInput {
  turno_id: string;
  monto: number;
}

export const crearIntencionPagoService = async (datos: CrearIntencionInput) => {
  const { turno_id, monto } = datos;

  // En un entorno real, aquí llamaría a:
  // const paymentIntent = await stripe.paymentIntents.create({ amount: monto * 100, currency: 'cop' });

  // Por ahora, simulamos la creación generando un ID único de transacción ficticio
  const transaccionSimuladaId = `pi_simulada_${Math.random().toString(36).substr(2, 9)}`;

  // Registrar el intento de pago en la tabla 'pagos_garantia' como 'pendiente'
  const { data: pago, error } = await supabase
    .from("pagos_garantia")
    .insert([
      {
        turno_id,
        pasarela: "stripe", // PUede ser cualquier otra pasarela de pago
        transaccion_id: transaccionSimuladaId,
        monto,
        estado: "pendiente",
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return {
    clientSecret: `secret_${transaccionSimuladaId}`, // Lo necesitará el frontend para renderizar el formulario de pago
    pagoId: pago.id,
    transaccionId: transaccionSimuladaId,
  };
};

/**
 * Lógica que se ejecutará cuando la pasarela nos confirme el pago (Webhook)
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
