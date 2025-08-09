# Stage 1: Build
FROM node:18 AS build

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript (make sure you have "build": "tsc" in package.json)
RUN npm run build

# Stage 2: Production
FROM node:18-slim AS prod

WORKDIR /app

# Install dependencies (including TypeScript for runtime compilation)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm install typescript@5.8.3

# Copy built files and runtime config
COPY --from=build /app/dist ./dist
COPY --from=build /app/deployment_config.json ./deployment_config.json
EXPOSE 3001

CMD ["node", "dist/http-server.js"]
