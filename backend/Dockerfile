FROM node:24-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json ./
RUN pnpm install
COPY tsconfig.json ./
COPY src/ ./src/
RUN pnpm build

FROM node:24-alpine
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json ./
RUN pnpm install --prod
COPY --from=builder /app/dist ./dist
EXPOSE 5000
ENV NODE_ENV=production
CMD ["node", "dist/app.js"]