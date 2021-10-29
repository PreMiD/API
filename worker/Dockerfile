FROM node:current-alpine

COPY package.json package.json
RUN yarn

COPY . .
RUN yarn build

FROM node:current-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY --from=0 package.json package.json
RUN yarn

COPY --from=0 dist .

CMD ["node", "index.js"]