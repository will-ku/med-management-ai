FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json ./

RUN rm -rf node_modules && \
    npm cache clean --force && \
    npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "dev"] 