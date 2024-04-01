FROM --platform=${BUILDPLATFORM} node:lts-alpine as base

WORKDIR /app

RUN corepack enable

FROM base as builder

RUN echo pnpm -v

COPY pnpm-lock.yaml ./
RUN pnpm fetch

COPY . .
RUN pnpm i
RUN pnpm --filter=./apps/worker build
RUN pnpm --filter=./apps/worker deploy --prod pruned

FROM oven/bun:1

ENV NODE_ENV=production

COPY --from=builder /app/pruned/dist ./
COPY --from=builder /app/pruned/node_modules ./node_modules

EXPOSE 3001

RUN bun install
USER bun
CMD ["bun", "index.js"]