# --- Etapa de Construcción ---
FROM node:24-alpine AS builder

WORKDIR /app

# 1. Activar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 2. Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# 3. SOLUCIÓN AL ERROR: Permitir scripts de build (necesario para esbuild/tsx)
RUN echo "ignore-scripts=false" > .npmrc
RUN pnpm install --frozen-lockfile

# 4. Copiar el resto del código (tsconfig.json, src/, etc.)
COPY . .

# 5. Compilar TypeScript
RUN pnpm build


# --- Etapa de Producción ---
FROM node:24-alpine

WORKDIR /app

# 1. Activar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 2. Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# 3. Permitir scripts también en producción (por si alguna dependencia lo necesita)
RUN echo "ignore-scripts=false" > .npmrc
RUN pnpm install --prod --frozen-lockfile

# 4. Copiar los archivos compilados desde la etapa de builder
COPY --from=builder /app/dist ./dist

# 5. Puerto (Render inyecta su propio puerto, pero exponemos 5000 por si acaso)
EXPOSE 5000

# 6. Entorno de producción
ENV NODE_ENV=production
ENV PORT=5000

# 7. Comando de inicio (¡Asegúrate de que tu archivo compilado se llame app.js!)
CMD ["node", "dist/app.js"]