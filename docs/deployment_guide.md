# SkillBridge AI Production Deployment Guide

This guide details step-by-step production deployment procedures for **SkillBridge AI** across major cloud platforms and virtual private servers.

---

## 1. Deployment Overview & Architecture

SkillBridge AI consists of three core components:
1. **Node.js Express Backend & Socket.IO Gateway** (`server/`)
2. **Python FastAPI AI Microservice** (`ai-service/`)
3. **MongoDB Database & Redis Cache**

```text
                              ┌──────────────────────────────────────────────┐
                              │          Nginx Reverse Proxy / SSL           │
                              └──────────────────────┬───────────────────────┘
                                                     │
                          ┌──────────────────────────┴──────────────────────────┐
                          │                                                     │
           ┌──────────────▼──────────────┐                       ┌──────────────▼──────────────┐
           │ Node.js Backend (Port 5000)  │                       │ Python FastAPI (Port 8000)   │
           └──────────────┬──────────────┘                       └──────────────┬──────────────┘
                          │                                                     │
             ┌────────────┴────────────┐                               ┌────────┴────────┐
             │ MongoDB Atlas (Port 27017)│                               │ Google Gemini   │
             └─────────────────────────┘                               └─────────────────┘
```

---

## 2. Render Deployment Guide

Render supports instant Docker & Web Service deployments.

### Step 1: Deploy FastAPI AI Service
1. Create a **New Web Service** on Render.
2. Select repository and choose environment: **Docker** (Root directory: `./ai-service`).
3. Set Environment Variables:
   - `GEMINI_API_KEY`: `<your_google_gemini_api_key>`
   - `SHARED_SECRET_KEY`: `skillbridge_secret_ai_key_2026`
4. Deploy and copy the service URL (e.g. `https://skillbridge-ai-service.onrender.com`).

### Step 2: Deploy Node.js Express Backend
1. Create a **New Web Service** on Render.
2. Environment: **Node** (Root directory: `./server`).
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Set Environment Variables:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `<your_mongodb_atlas_uri>`
   - `JWT_SECRET`: `<32_char_secret>`
   - `JWT_REFRESH_SECRET`: `<32_char_secret>`
   - `AI_SERVICE_URL`: `https://skillbridge-ai-service.onrender.com`
   - `AI_SHARED_SECRET`: `skillbridge_secret_ai_key_2026`
   - `CLIENT_URL`: `https://skillbridge.ai`

---

## 3. Railway Deployment Guide

Railway supports Docker Compose and multi-service repositories.

1. Connect your GitHub repository to Railway.
2. Railway will automatically detect `docker-compose.yml`.
3. Provision a **MongoDB Database** plugin and a **Redis** plugin in Railway.
4. Set environment variables in Railway Dashboard:
   - `GEMINI_API_KEY`: `<your_gemini_key>`
   - `MONGODB_URI`: `${{MongoDB.MONGO_URL}}`
   - `REDIS_URL`: `${{Redis.REDIS_URL}}`
5. Click **Deploy**.

---

## 4. DigitalOcean App Platform & Droplets

### Option A: App Platform (Managed Containers)
1. Select **Create App** -> GitHub Repository.
2. Add Service 1: `server/Dockerfile` (Port 5000).
3. Add Service 2: `ai-service/Dockerfile` (Port 8000).
4. Add Database: Managed MongoDB & Managed Redis.
5. Set Environment variables and deploy.

### Option B: Droplet (Docker Compose)
1. Launch an Ubuntu 22.04 LTS Droplet.
2. Install Docker & Docker Compose:
   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose
   ```
3. Clone repository and run:
   ```bash
   docker-compose up -d --build
   ```

---

## 5. AWS EC2 & Ubuntu VPS Deployment Guide

### Step 1: Provision Server & Install Prerequisites
Connect via SSH to your Ubuntu VPS / AWS EC2 instance:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git nodejs npm python3 python3-pip nginx certbot python3-certbot-nginx
```

### Step 2: Install PM2 for Process Management
```bash
sudo npm install -g pm2
```

### Step 3: Clone Code & Configure Node.js Backend
```bash
git clone https://github.com/Arth0504/SkillBridge-AI.git
cd SkillBridge-AI/server
npm ci --only=production
cp .env.production .env
```
Start Node.js via PM2 Cluster Mode:
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### Step 4: Configure Python FastAPI AI Microservice
```bash
cd ../ai-service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pm2 start "python3 -m uvicorn app:app --host 127.0.0.1 --port 8000" --name "skillbridge-ai-service"
pm2 save
```

### Step 5: Configure Nginx & Free SSL (Let's Encrypt)
Copy `nginx/conf.d/default.conf` to `/etc/nginx/sites-available/skillbridge`:
```bash
sudo cp ../nginx/conf.d/default.conf /etc/nginx/sites-available/skillbridge
sudo ln -s /etc/nginx/sites-available/skillbridge /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```
Obtain free Let's Encrypt SSL certificate:
```bash
sudo certbot --nginx -d api.skillbridge.ai
```

---

## 6. Pre-Flight Production Checklist

- [x] All 20 Security Controls active in `server/middleware/security.middleware.js`
- [x] Account Lockout active (5 failed attempts -> 15m lock)
- [x] Refresh Token Rotation & Session Revocation active
- [x] Diagnostic `/health` endpoint returning 200 OK
- [x] MongoDB Indexing synchronized
- [x] Redis Cache configured with silent fallback resilience
- [x] Graceful shutdown handling `SIGINT`/`SIGTERM`
