# OptiTurno

OptiTurno es una plataforma web y móvil full-stack diseñada para la gestión automatizada, optimización y reserva de turnos para negocios y profesionales. Permite sincronizar la disponibilidad del personal en tiempo real, ofreciendo una experiencia fluida tanto para el administrador como para el usuario final.

---

## Tecnologías Core

El proyecto está construido bajo una arquitectura desacoplada utilizando el siguiente ecosistema tecnológico:

* **Backend:** Node.js, Fastify.js, TypeScript.
* **Base de Datos / Auth:** Supabase (PostgreSQL) con Row-Level Security (RLS).
* **Gestor de Paquetes:** pnpm.
* **Pruebas de API:** Bruno (Colecciones versionadas en Git).

---

## Requisitos Previos

Antes de empezar, asegúrate de tener instalado en tu sistema local:

* **Node.js** (Versión v20 o superior recomendada)
* **pnpm** (Gestor de paquetes global)
* Una instancia activa en **Supabase** (para las variables de entorno)

---

## Arquitectura del Proyecto

El repositorio está estructurado en un monorepo simple / carpetas independientes:

```text
OptiTurno/
├── backend/     # API REST en Node.js + TypeScript
└── frontend/    # Aplicación de cliente (Interfaz de usuario)
```

## Run Locally

1. Install dependencies:
   `pnpm install`
2. Run the app:
   `pnpm run dev`
