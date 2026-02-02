FROM node:18 AS base
WORKDIR /workspace
COPY package*.json ./
RUN npm install
COPY . .

CMD ["npm","start"]
