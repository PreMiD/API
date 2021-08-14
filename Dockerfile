FROM node:current-alpine

COPY . .

RUN yarn
RUN yarn build
RUN npm prune --production

FROM node:current-alpine

COPY --from=0 /dist .
COPY --from=0 /node_modules node_modules

EXPOSE 3001

ENV NODE_ENV=production

CMD [ "node", "index", "--no-cluster"]
