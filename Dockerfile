FROM node:20.2.0-bullseye-slim

WORKDIR /app
COPY package.json ./

RUN npm i
# COPY key.json ./
# ENV GOOGLE_APPLICATION_CREDENTIALS="/app/key.json"

COPY ./src ./src

CMD ["npm", "start"]

