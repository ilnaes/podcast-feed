FROM node:20.2.0-bullseye-slim

WORKDIR /app
COPY package.json ./

RUN npm i
COPY key.json .env ./

COPY ./src ./src

CMD ["npm", "start"]

