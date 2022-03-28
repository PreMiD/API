FROM node:16.11.0

COPY package.json package.json
RUN yarn

COPY . .
RUN yarn build

FROM node:16.11.0

WORKDIR /app

ENV NODE_ENV=production

COPY --from=0 package.json package.json
RUN yarn

COPY --from=0 dist .

CMD ["node", "index.js"]