# Backend NestJS — imagem de produção
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production

# Roda as migrações e inicia a API
CMD ["sh", "-c", "npm run migration:run && npm run start:prod"]
