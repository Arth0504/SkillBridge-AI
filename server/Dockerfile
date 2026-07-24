# Step 1: Use official lightweight Node.js 20 Alpine base image
FROM node:20-alpine AS base

# Step 2: Set working directory inside container
WORKDIR /app

# Step 3: Copy package definition files
COPY package*.json ./

# Step 4: Install production dependencies cleanly
RUN npm ci --only=production

# Step 5: Copy application source code
COPY . .

# Step 6: Expose application port
EXPOSE 5000

# Step 7: Define default start command
CMD ["node", "server.js"]
