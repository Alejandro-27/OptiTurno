// Error controlado de la lógica de negocio. Es el único camino por el que un
// mensaje pensado para el cliente llega al error handler global.
export class AppError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "AppError";
    this.status = status;
  }
}
