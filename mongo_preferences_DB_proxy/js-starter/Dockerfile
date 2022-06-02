FROM node:14.16.1

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install

COPY reorder.js reorder.js

CMD [ "node", "reorder.js" ]