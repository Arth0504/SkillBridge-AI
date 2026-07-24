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
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Expose backend port
EXPOSE 5000

# Non-root security user
USER node

# Start Node.js Express server
CMD ["node", "server.js"]
