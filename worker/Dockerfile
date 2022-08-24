FROM gplane/pnpm:alpine

COPY package.json pnpm-lock.yaml ./
RUN pnpm i --frozen-lockfile

COPY . .
RUN pnpm build

FROM gplane/pnpm:alpine

WORKDIR /app

ENV NODE_ENV=production

COPY --from=0 package.json pnpm-lock.yaml ./
RUN pnpm i --frozen-lockfile --prod

COPY --from=0 dist .

EXPOSE 3001

CMD ["node", "index.js"]