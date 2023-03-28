FROM node:lts-alpine as base

WORKDIR /app

RUN corepack enable

FROM base as builder

RUN echo pnpm -v

COPY pnpm-lock.yaml ./
RUN pnpm fetch

COPY . .
RUN pnpm i
RUN pnpm --filter=./apps/master build
RUN pnpm --filter=./apps/master deploy --prod pruned

FROM base

ENV NODE_ENV=production

COPY --from=builder /app/pruned/dist ./
COPY --from=builder /app/pruned/node_modules ./node_modules

CMD ["node", "index.js"]