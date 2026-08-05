# Multi-Stage Production Dockerfile for SkillBridge AI Platform

# Stage 1: Build Client Static Assets
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Production Server Runtime Environment
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy Server Dependencies & Code
COPY server/package*.json ./server/
RUN cd server && npm ci --only=production
COPY server/ ./server/

# Copy Client Static Dist to Server public static directory
COPY --from=client-builder /app/client/dist ./server/public

EXPOSE 5000

WORKDIR /app/server
CMD ["node", "server.js"]
