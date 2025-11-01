FROM node:20-alpine AS builder

WORKDIR /bibliotek

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build:prod

FROM node:20-alpine AS runner

WORKDIR /bibliotek

COPY --from=builder /bibliotek/dist ./dist
COPY --from=builder /bibliotek/package*.json ./

RUN npm install --omit=dev

EXPOSE 4000

CMD ["node", "dist/bibliotek/server/server.mjs"]