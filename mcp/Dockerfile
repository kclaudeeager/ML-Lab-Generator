# Stage 1: Build
FROM node:18 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build # Assumes you have a build script ("tsc")

# Stage 2: Production
FROM node:18-slim AS prod

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/deployment_config.json ./
COPY --from=build /app/.env ./
# (Copy any other needed files, e.g. public assets, config, etc.)

EXPOSE 3001

CMD ["node", "dist/http-server.js"] 