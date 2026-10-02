import type { ContenidoLegal } from "../components/PaginaLegal";

const RAZON = "[RAZÓN SOCIAL]";
const NIT = "[NIT]";
const DOMICILIO = "[DIRECCIÓN]";
const EMAIL = "[EMAIL]";
const FECHA = "1 de enero de 2026";

export const PRIVACIDAD: ContenidoLegal = {
  slug: "privacidad",
  titulo: "Política de Privacidad",
  actualizacion: FECHA,
  introduccion: `En OptiTurno (${RAZON}, ${NIT}) respetamos tu privacidad y tratamos tus datos personales de forma transparente, conforme a la ley de protección de datos aplicable (Ley 1581 de 2012 en Colombia) y al Reglamento General de Protección de Datos (RGPD) de la Unión Europea en lo que corresponda.`,
  secciones: [
    {
      titulo: "1. Responsable del tratamiento",
      parrafos: [
        `Responsable del tratamiento: ${RAZON}, con NIT ${NIT}, domicilio en ${DOMICILIO}.`,
        `Contacto de privacidad: ${EMAIL}. Responderemos tus solicitudes en un plazo máximo de 15 días hábiles.`,
      ],
    },
    {
      titulo: "2. Datos que recopilamos",
      parrafos: [
        "Datos que nos proporcionas al crear tu cuenta y reservar turnos: nombre, correo electrónico, teléfono y el contenido de tus citas (servicio, profesional, fecha y hora).",
        "Datos técnicos generados automáticamente: dirección IP, tipo de dispositivo y navegador, y cookies de preferencias o de análisis (ver Política de Cookies). No recopilamos datos de ubicación ni biométricos.",
        "No recopilamos datos sensibles, salvo que nos los aportes voluntariamente en una comunicación. En ese caso serán tratados con el máximo nivel de protección.",
      ],
    },
    {
      titulo: "3. Finalidades del tratamiento",
      parrafos: [
        "Gestionar tu cuenta y autenticación en la plataforma.",
        "Procesar y gestionar tus reservas de turnos, sus reprogramaciones y cancelaciones.",
        "Enviarte recordatorios de tus citas por WhatsApp o correo, siempre como parte del servicio solicitado.",
        "Mejorar la plataforma con fines estadísticos, siempre que hayas aceptado las cookies de análisis.",
        "Cumplir obligaciones legales y prevenir el fraude.",
      ],
    },
    {
      titulo: "4. Base legal",
      parrafos: [
        "La ejecución del contrato de servicio (al crear tu cuenta y reservar).",
        "Tu consentimiento explícito para el tratamiento de datos, que otorgas al registrarte y al confirmar cada reserva, y que puedes revocar en cualquier momento.",
        "El interés legítimo en prevenir el fraude y garantizar la seguridad de la plataforma.",
      ],
    },
    {
      titulo: "5. Compartir tus datos",
      parrafos: [
        "Solo compartiremos tus datos con el comercio donde reservas (por ejemplo, la barbería o el centro de estética) para la prestación del servicio que solicitaste.",
        "Con proveedores tecnológicos que actúan como encargados del tratamiento (hosting, mensajería). No vendemos ni alquilamos tus datos.",
        "Con autoridades competentes cuando lo exija la ley.",
      ],
    },
    {
      titulo: "6. Conservación",
      parrafos: [
        "Conservamos tus datos mientras tengas cuenta activa y durante el plazo legal exigido después. Puedes solicitar la eliminación en cualquier momento; la eliminación se realizará salvo que una obligación legal exija mantenerlos.",
      ],
    },
    {
      titulo: "7. Tus derechos",
      parrafos: [
        "Tienes derecho a acceder, rectificar, suprimir, limitar, portar y oponerte al tratamiento de tus datos, así como a revocar el consentimiento otorgado.",
        "Para ejercer tus derechos escríbenos a ${EMAIL}. También puedes contactar a la autoridad de protección de datos competente si consideras que tus derechos fueron vulnerados.",
      ],
    },
    {
      titulo: "8. Menores de edad",
      parrafos: [
        "La plataforma está dirigida a mayores de 14 años. Si eres menor de 14 no puedes crear una cuenta sin autorización de tus padres o tutores, quienes responderán por la información suministrada.",
      ],
    },
    {
      titulo: "9. Cambios a esta política",
      parrafos: [
        "Notificaremos cambios importantes con al menos 15 días de antelación a través de la plataforma o por correo electrónico. La versión vigente siempre estará disponible en esta página.",
      ],
    },
  ],
};

export const TERMINOS: ContenidoLegal = {
  slug: "terminos",
  titulo: "Términos y Condiciones",
  actualizacion: FECHA,
  introduccion: `Estos Términos regulan el uso de la plataforma de agendamiento de citas OptiTurno, operada por ${RAZON} (NIT ${NIT}). Al crear una cuenta o reservar un turno aceptas estos términos en su totalidad.`,
  secciones: [
    {
      titulo: "1. El servicio",
      parrafos: [
        "OptiTurno es una plataforma de agendamiento que conecta clientes con comercios de servicios presenciales (barberías, estética, salud y similares).",
        "El comercio es responsable de la prestación del servicio contratado. OptiTurno actúa como intermediario tecnológico y no es responsable del resultado del servicio ofrecido por el comercio.",
      ],
    },
    {
      titulo: "2. Cuenta de usuario",
      parrafos: [
        "Debes ser mayor de 14 años y proporcionar información veraz. Eres responsable de mantener la confidencialidad de tu contraseña.",
        "Podemos suspender cuentas que usen la plataforma de forma fraudulenta o contraria a la ley.",
      ],
    },
    {
      titulo: "3. Reservas y cancelaciones",
      parrafos: [
        "Las reservas se confirman según disponibilidad. En caso de doble reserva, solo será válida la primera confirmada.",
        "Cada comercio puede definir políticas propias de cancelación o reprogramación. Las cancelaciones se envían con confirmación por la plataforma.",
        "La inasistencia repetida sin aviso puede impedir futuras reservas en el comercio, a criterio de este.",
      ],
    },
    {
      titulo: "4. Precios y pagos",
      parrafos: [
        "Los precios que muestra cada comercio incluyen los impuestos aplicables salvo que se indique lo contrario.",
        "El pago puede realizarse en el punto de venta del comercio o por los medios que cada comercio habilite. La plataforma puede retener una garantía equivalente al valor del servicio en caso de no asistencia, según lo informe el comercio al momento de reservar.",
      ],
    },
    {
      titulo: "5. Recordatorios por WhatsApp",
      parrafos: [
        "Aceptas recibir recordatorios de tus citas por WhatsApp o correo electrónico. Puedes desactivarlos desde tu perfil en cualquier momento.",
      ],
    },
    {
      titulo: "6. Conducta del usuario",
      parrafos: [
        "Te comprometes a no usar la plataforma para fines ilegales, a no publicar contenido ofensivo y a no intentar vulnerar la seguridad del servicio.",
      ],
    },
    {
      titulo: "7. Responsabilidad y garantías",
      parrafos: [
        "En virtud del Estatuto del Consumidor (Ley 1480 de 2011), los servicios prestados por los comercios gozan de garantía legal. Para reclamaciones sobre el servicio contratado, contacta primero al comercio.",
        "OptiTurno no garantiza la disponibilidad ininterrumpida del servicio, pero hará esfuerzos razonables para mantenerlo operativo.",
        "Nuestra responsabilidad en ningún caso superará el valor del turno involucrado, salvo dolo o culpa grave.",
      ],
    },
    {
      titulo: "8. Propiedad intelectual",
      parrafos: [
        "La plataforma, su diseño, logotipos y código son propiedad de OptiTurno. No puedes copiarlos ni usarlos sin autorización.",
      ],
    },
    {
      titulo: "9. Ley aplicable y jurisdicción",
      parrafos: [
        "Estos términos se rigen por las leyes de la República de Colombia. Para controversias se aplicará la jurisdicción ordinaria de ${DOMICILIO}, sin perjuicio de los derechos del consumidor.",
      ],
    },
  ],
};

export const COOKIES: ContenidoLegal = {
  slug: "cookies",
  titulo: "Política de Cookies",
  actualizacion: FECHA,
  introduccion:
    "Esta política explica qué cookies y tecnologías similares utiliza OptiTurno y cómo puedes controlarlas.",
  secciones: [
    {
      titulo: "1. Qué son las cookies",
      parrafos: [
        "Las cookies son pequeños archivos que el navegador almacena en tu dispositivo para recordar información.",
      ],
    },
    {
      titulo: "2. Cookies que usamos",
      parrafos: [
        "Cookies técnicas o esenciales: imprescindibles para el funcionamiento (mantener tu sesión iniciada, recordar el tema claro/oscuro). No requieren consentimiento.",
        "Cookies de análisis: nos ayudan a entender cómo se usa la plataforma (páginas vistas, tiempos de carga). Solo se cargan si aceptas la política (Google Analytics 4).",
        "No usamos cookies de publicidad ni de terceros no esenciales.",
      ],
    },
    {
      titulo: "3. Cómo aceptar o rechazar",
      parrafos: [
        "Al visitar la plataforma por primera vez verás un aviso con dos opciones: aceptar o rechazar las cookies no esenciales.",
        "Puedes borrar las cookies desde la configuración de tu navegador en cualquier momento.",
        "Rechazar las cookies de análisis no afecta el funcionamiento de la plataforma.",
      ],
    },
    {
      titulo: "4. Contacto",
      parrafos: [`Para consultas sobre esta política, escríbenos a ${EMAIL}.`],
    },
  ],
};

export const AVISO_LEGAL: ContenidoLegal = {
  slug: "aviso-legal",
  titulo: "Aviso Legal",
  actualizacion: FECHA,
  introduccion: `En cumplimiento del deber de información del comercio electrónico, te informamos de los datos identificativos de la empresa propietaria de OptiTurno.`,
  secciones: [
    {
      titulo: "1. Identificación del responsable",
      parrafos: [
        `Razón social: ${RAZON}.`,
        `NIT: ${NIT}.`,
        `Domicilio: ${DOMICILIO}.`,
        `Correo de contacto: ${EMAIL}.`,
        `Objeto social: desarrollo y operación de software de agendamiento de citas.`,
      ],
    },
    {
      titulo: "2. Propiedad de la plataforma",
      parrafos: [
        "Los contenidos, marcas y elementos gráficos de OptiTurno son titularidad de su responsable o de terceros licenciantes, con derechos reservados. Queda prohibida su reproducción sin autorización.",
      ],
    },
    {
      titulo: "3. Enlaces",
      parrafos: [
        "Los enlaces a sitios de terceros tienen fines informativos. No asumimos responsabilidad por el contenido de sitios externos.",
      ],
    },
    {
      titulo: "4. Legislación aplicable",
      parrafos: [
        "Estas condiciones se rigen por la legislación colombiana. Cualquier controversia se someterá a la jurisdicción ordinaria, sin perjuicio de los derechos del consumidor.",
      ],
    },
  ],
};
