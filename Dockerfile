FROM node:22-alpine

WORKDIR /app

ADD . /app/

RUN npm i

EXPOSE 3000

ENTRYPOINT [ "node","server.js" ]