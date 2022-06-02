FROM node:14.16.1

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install

COPY sqlConnector.js sqlConnector.js

COPY sqlAdapter.js sqlAdapter.js

COPY server.js server.js

CMD [ "node", "server.js" ]