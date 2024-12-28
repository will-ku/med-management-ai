FROM node:22-bookworm-slim
#FROM node:20-alpine
# FROM node:22-alpine
# FROM --platform=linux/amd64 node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"] 