FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json ./

RUN rm -rf node_modules
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"] 