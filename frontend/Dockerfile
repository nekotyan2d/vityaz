FROM node:24-slim AS builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
ARG NUXT_PUBLIC_API_URL
ENV NUXT_PUBLIC_API_URL=$NUXT_PUBLIC_API_URL
RUN npm run build

FROM node:24-alpine
WORKDIR /app
COPY --from=builder /app/.output ./

EXPOSE 3000
ENV HOST=0.0.0.0
ENV PORT=3000
CMD ["node", "server/index.mjs"]
