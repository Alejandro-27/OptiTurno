# --- Etapa de Construcción ---
FROM node:22-alpine AS builder

WORKDIR /app

# 1. Activar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 2. Copiar solo el package.json
COPY package.json ./

# 3. SOLUCIÓN DEFINITIVA PARA PNPM V9: Aprobar esbuild para que ejecute sus scripts
RUN pnpm install --config.onlyBuiltDependencies=esbuild

# 4. Copiar el resto del código (tsconfig.json, src/, etc.)
COPY . .

# 5. Compilar TypeScript
RUN pnpm build


# --- Etapa de Producción ---
FROM node:22-alpine

WORKDIR /app

# 1. Activar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 2. Copiar package.json
COPY package.json ./

# 3. Instalar solo dependencias de producción (aquí no falla porque esbuild es dev)
RUN pnpm install --prod

# 4. Copiar los archivos compilados desde la etapa de builder
COPY --from=builder /app/dist ./dist

# 5. Configuración final
EXPOSE 5000
ENV NODE_ENV=production
ENV PORT=5000

# 6. Comando de inicio
CMD ["node", "dist/app.js"]