# ---------------------------------------------------
# Stage 1: Build & Dependencies
# ---------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# ---------------------------------------------------
# Stage 2: Production Runtime
# ---------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy node_modules from builder
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node . .

# Expose backend port
EXPOSE 5000

# Non-root security user
USER node

# Production container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start Node.js Express server
CMD ["node", "server.js"]
