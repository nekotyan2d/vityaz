FROM node:24-slim AS builder
WORKDIR /app
RUN npm install -g pnpm@10.12.4
COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:24-slim
WORKDIR /app
RUN npm install -g pnpm@10.12.4
COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile --prod
COPY --from=builder /app/dist ./dist
COPY drizzle ./drizzle

EXPOSE 8000
CMD ["sh", "-c", "node dist/db/migrate.mjs && node dist/index.mjs"]
