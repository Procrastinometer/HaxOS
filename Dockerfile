FROM node:20-alpine AS builder

# Встановлюємо робочу директорію
WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY tsconfig.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/maps ./maps

USER node

CMD ["node", "dist/index.js"]