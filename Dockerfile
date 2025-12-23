FROM node:22.14.0 AS build-stage

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm@latest

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

FROM alpine:latest

WORKDIR /app/dist

COPY --from=build-stage /app/dist ./

CMD ["echo", "Build completed. Dist files available in /app/dist"]
