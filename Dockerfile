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
ENV PORT=5000

# Copy Server Dependencies & Code
COPY --chown=node:node server/package*.json ./server/
RUN cd server && npm ci --only=production
COPY --chown=node:node server/ ./server/

# Copy Client Static Dist to Server public static directory
COPY --chown=node:node --from=client-builder /app/client/dist ./server/public

EXPOSE 5000

USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

WORKDIR /app/server
CMD ["node", "server.js"]
