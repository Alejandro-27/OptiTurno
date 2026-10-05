import { configWhatsApp, whatsappHabilitado } from "../config/whatsapp";

/**
 * Cliente REST de Evolution API v2 (WhatsApp self-hosted).
 * Todas las llamadas usan `fetch` nativo (Node 24): sin SDKs nuevos.
 *
 * La API de Evolution responde con shapes distintos según el código (201/200 a
 * veces envueltos en `{ status, response }`), así que acá solo se valida el
 * código HTTP y se guarda el cuerpo crudo para diagnóstico en los logs.
 */

export interface ResultadoEnvioWhatsApp {
  ok: boolean;
  /** Código HTTP de Evolution (0 si hubo fallo de red/timeout). */
  status: number;
  /** Mensaje genérico, apto para guardar en `notificaciones.error`. */
  error?: string;
  /** Cuerpo crudo de la respuesta, solo para logs internos. */
  detalle?: unknown;
}

/**
 * Normaliza un teléfono a dígitos con prefijo internacional.
 * "57" es el prefijo por defecto (Colombia): "300 123 4567" -> "573001234567".
 */
export const normalizarTelefono = (telefono: string | null): string | null => {
  if (!telefono) return null;
  let digitos = telefono.replace(/\D/g, "");
  if (!digitos) return null;
  // Prefijo internacional presente: 10-15 dígitos que no empiezan en 0.
  if (digitos.startsWith("00")) digitos = digitos.slice(2);
  if (digitos.startsWith("0")) digitos = digitos.slice(1);
  if (digitos.length <= 10) digitos = `57${digitos}`;
  return digitos.length >= 11 && digitos.length <= 15 ? digitos : null;
};

/**
 * Envía un mensaje de texto. Nunca lanza: devuelve `{ ok: false }` ante
 * cualquier fallo (contenedor apagado, timeout, 4xx/5xx) para que el llamador
 * registre el error y siga con el resto de los turnos.
 */
export const enviarTextoWhatsApp = async (
  numero: string,
  texto: string,
): Promise<ResultadoEnvioWhatsApp> => {
  if (!whatsappHabilitado()) {
    return {
      ok: false,
      status: 0,
      error: "WhatsApp no configurado (falta WHATSAPP_API_KEY).",
    };
  }

  const url = `${configWhatsApp.apiUrl}/message/sendText/${encodeURIComponent(
    configWhatsApp.instancia,
  )}`;

  try {
    const respuesta = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: configWhatsApp.apiKey,
      },
      body: JSON.stringify({ number: numero, text: texto }),
      signal: AbortSignal.timeout(configWhatsApp.timeoutMs),
    });

    const crudo = await respuesta.text();
    let cuerpo: unknown = crudo;
    try {
      cuerpo = crudo ? JSON.parse(crudo) : null;
    } catch {
      // Respuesta no-JSON: se conserva el texto para el log.
    }

    if (!respuesta.ok) {
      return {
        ok: false,
        status: respuesta.status,
        error: `Evolution API respondió ${respuesta.status}.`,
        detalle: cuerpo,
      };
    }

    return { ok: true, status: respuesta.status, detalle: cuerpo };
  } catch (error) {
    // ECONNREFUSED / DNS / timeout: el contenedor puede estar apagado.
    const mensaje =
      error instanceof Error ? error.message : "Error de red desconocido.";
    return {
      ok: false,
      status: 0,
      error: `No se pudo conectar con Evolution API: ${mensaje}`,
    };
  }
};

/** Estado de la instancia en Evolution (open = conectada, close = sin QR). */
export const consultarEstadoInstancia = async (): Promise<string | null> => {
  if (!whatsappHabilitado()) return null;
  try {
    const respuesta = await fetch(
      `${configWhatsApp.apiUrl}/instance/connectionState/${encodeURIComponent(
        configWhatsApp.instancia,
      )}`,
      {
        headers: { apikey: configWhatsApp.apiKey },
        signal: AbortSignal.timeout(configWhatsApp.timeoutMs),
      },
    );
    if (!respuesta.ok) return null;
    const cuerpo = (await respuesta.json()) as {
      instance?: { state?: string };
    };
    return cuerpo?.instance?.state ?? null;
  } catch {
    return null;
  }
};
