FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json ./

RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

RUN npm ci && \
    npm rebuild sqlite3

COPY . .

RUN rm -rf dist && npm run build


EXPOSE 3000

CMD ["npm", "run", "dev"] 