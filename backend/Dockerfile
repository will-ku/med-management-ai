FROM node:22-bookworm-slim
# FROM node:22-alpine
# FROM --platform=linux/amd64 node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"] 