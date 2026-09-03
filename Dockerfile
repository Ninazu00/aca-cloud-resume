# Stage 1 — install dependencies
FROM node:25-slim AS builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Stage 2 — lean runtime image (no npm)
FROM node:25-slim
WORKDIR /app

# Patch OS-level vulnerabilities in the base image
RUN apt-get update && \
    apt-get upgrade -y --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

RUN rm -rf /usr/local/lib/node_modules/npm && \
    rm -f /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack

COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY backend/server.js ./backend/server.js
COPY frontend/ ./frontend/

ENV NODE_ENV=production
EXPOSE 3000
USER node
CMD ["node", "backend/server.js"]
