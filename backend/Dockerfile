FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json ./

# Install build dependencies for sqlite3
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

RUN rm -rf node_modules && \
    npm cache clean --force && \
    npm ci && \
    npm rebuild sqlite3

COPY . .

RUN rm -rf dist && npm run build

EXPOSE 3000

CMD ["npm", "run", "dev"] 