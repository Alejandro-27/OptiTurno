# --- Etapa de Construcción ---
FROM node:24-alpine AS builder

WORKDIR /app

# 1. Activar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 2. Copiar SOLO el package.json (quitamos el lockfile para evitar el error)
COPY package.json ./

# 3. Permitir scripts de build
RUN echo "ignore-scripts=false" > .npmrc

# 4. Instalar dependencias
RUN pnpm install

# 5. Copiar el resto del código (tsconfig.json, src/, etc.)
COPY . .

# 6. Compilar TypeScript
RUN pnpm build


# --- Etapa de Producción ---
FROM node:24-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json ./
RUN echo "ignore-scripts=false" > .npmrc
RUN pnpm install --prod

COPY --from=builder /app/dist ./dist

EXPOSE 5000
ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "dist/app.js"]