export interface PagosRepositorio {
  confirmarPago(transaccionId: string): Promise<{ success: boolean; message: string }>;
}

export const pagosRepositorioMock: PagosRepositorio = {
  // Demo: confirma localmente sin backend ni pasarela.
  async confirmarPago(transaccionId) {
    return {
      success: true,
      message: "Turno confirmado y pago aprobado correctamente.",
    };
  },
};

export const pagosRepositorioApi: PagosRepositorio = {
  // Stripe confirma el pago vía webhook directo al backend (/api/pagos/webhook).
  // El frontend NO simula el webhook: aquí simplemente confirmamos la UX tras
  // obtener `paymentIntent.status === "succeeded"` en el Payment Element.
  async confirmarPago(transaccionId) {
    return {
      success: true,
      message: "Pago aprobado por la pasarela.",
    };
  },
};