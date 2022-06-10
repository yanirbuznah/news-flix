FROM node:14.16.1

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install

COPY preferences_db_proxy.js preferences_db_proxy.js

CMD [ "node", "preferences_db_proxy.js" ]