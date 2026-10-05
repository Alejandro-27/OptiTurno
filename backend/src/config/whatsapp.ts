import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

/**
 * Configuración del proveedor de WhatsApp (Evolution API v2).
 * Si falta WHATSAPP_API_KEY el módulo queda deshabilitado: el cron de
 * recordatorios no se registra y el backend sigue funcionando normal.
 */

const esquemaConfig = z.object({
  WHATSAPP_API_URL: z
    .string()
    .url()
    .default("http://localhost:8080")
    .transform((valor) => valor.replace(/\/+$/, "")),
  WHATSAPP_API_KEY: z.string().min(1).optional(),
  WHATSAPP_INSTANCE_NAME: z.string().min(1).default("optiturno"),
  // Ventanas (en horas antes del turno) que procesa el cron.
  RECORDATORIOS_VENTANAS: z
    .string()
    .default("24")
    .transform((valor) =>
      valor
        .split(",")
        .map((n) => Number(n.trim()))
        .filter((n) => Number.isInteger(n) && n > 0 && n <= 168),
    ),
  // Expresión cron (minuto hora día mes día-semana).
  RECORDATORIOS_CRON: z.string().min(1).default("0 * * * *"),
  // Zona horaria para el cálculo de "mañana" y de las ventanas.
  RECORDATORIOS_TZ: z.string().min(1).default("America/Bogota"),
  // Secreto del endpoint manual POST /api/recordatorios/procesar.
  RECORDATORIOS_CRON_SECRET: z.string().min(1).optional(),
  // Intentos máximos antes de dejar el recordatorio en 'fallido' definitivo.
  RECORDATORIOS_MAX_INTENTOS: z.coerce.number().int().min(1).max(10).default(3),
  // Timeout de la petición HTTP a Evolution API (ms).
  WHATSAPP_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .min(1000)
    .max(60000)
    .default(10000),
});

const parseado = esquemaConfig.safeParse(process.env);

if (!parseado.success) {
  throw new Error(
    `Configuración de WhatsApp inválida: ${parseado.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ")}`,
  );
}

export const configWhatsApp = {
  apiUrl: parseado.data.WHATSAPP_API_URL,
  apiKey: parseado.data.WHATSAPP_API_KEY ?? "",
  instancia: parseado.data.WHATSAPP_INSTANCE_NAME,
  ventanas: parseado.data.RECORDATORIOS_VENTANAS,
  cron: parseado.data.RECORDATORIOS_CRON,
  zonaHoraria: parseado.data.RECORDATORIOS_TZ,
  cronSecret: parseado.data.RECORDATORIOS_CRON_SECRET ?? "",
  maxIntentos: parseado.data.RECORDATORIOS_MAX_INTENTOS,
  timeoutMs: parseado.data.WHATSAPP_TIMEOUT_MS,
};

/** El proveedor está operativo cuando hay URL + API key configuradas. */
export const whatsappHabilitado = (): boolean =>
  Boolean(configWhatsApp.apiUrl && configWhatsApp.apiKey);
