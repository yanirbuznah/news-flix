FROM node:14.16.1

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install

COPY redirect.js redirect.js

CMD [ "node", "redirect.js" ]