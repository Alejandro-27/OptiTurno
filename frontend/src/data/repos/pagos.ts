export interface PagosRepositorio {
  confirmarPago(transaccionId: string): Promise<{ success: boolean; message: string }>;
}

export const pagosRepositorioMock: PagosRepositorio = {
  async confirmarPago(transaccionId) {
    return {
      success: true,
      message: "Turno confirmado y pago aprobado correctamente.",
    };
  },
};

export const pagosRepositorioApi: PagosRepositorio = {
  async confirmarPago(transaccionId) {
    const { simularWebhookPagoExitoso } = await import("../../api/pagos.api");
    return simularWebhookPagoExitoso({
      transaccionId,
      evento: "pago_aprobado",
    });
  },
};