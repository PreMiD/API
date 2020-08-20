FROM node:current-slim

WORKDIR /PreMiD/API

COPY . .

RUN yarn run init

EXPOSE 3001

ENV NODE_ENV=production

CMD [ "yarn", "start" ]
