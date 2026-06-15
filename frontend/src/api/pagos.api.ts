import { apiClient } from "./api.client";

interface WebhookSimuladoInput {
  transaccionId: string;
  evento: "payment_intent.succeeded" | "pago_aprobado";
}

interface WebhookResponse {
  success: boolean;
  message: string;
}

// Simula el comportamiento de la pasarela notificando un pago exitoso
export const simularWebhookPagoExitoso = async (
  datos: WebhookSimuladoInput,
): Promise<WebhookResponse> => {
  const { data } = await apiClient.post<WebhookResponse>(
    "/pagos/webhook",
    datos,
  );
  return data;
};
