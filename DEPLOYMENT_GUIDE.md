# SkillBridge AI — Enterprise Production Deployment Guide

## 1. System Prerequisites
- **Operating System**: Linux (Ubuntu 22.04 LTS / Debian 12 / AWS Linux 2023) or macOS / Windows Server
- **Docker & Docker Compose**: Docker Engine 24+ and Docker Compose v2.20+
- **Memory**: Minimum 4 GB RAM (8 GB Recommended)
- **Disk Space**: Minimum 20 GB SSD storage
- **Ports Needed**: `80` (HTTP), `443` (HTTPS), `5000` (Node Backend), `8000` (FastAPI AI Microservice)

---

## 2. Environment Configuration

Copy `.env.example` to `.env` in the root directory:
```bash
cp .env.example .env
```

Ensure production values are set:
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://mongodb:27017/skillbridge
REDIS_URL=redis://redis:6379
JWT_SECRET=your_super_secret_jwt_key_2026
JWT_REFRESH_SECRET=your_super_secret_refresh_key_2026
GEMINI_API_KEY=your_gemini_api_key
```

---

## 3. Docker Production Deployment

Build and spin up the complete containerized platform:
```bash
docker-compose up -d --build
```

Verify running services:
```bash
docker-compose ps
```

Container Health Diagnostics:
- **Nginx Reverse Proxy**: `http://localhost:80`
- **Node Server & Socket.IO**: `http://localhost:5000`
- **FastAPI AI Microservice**: `http://localhost:8000/docs`
- **Health Check Endpoint**: `http://localhost:5000/api/health`
- **Readiness Check Endpoint**: `http://localhost:5000/api/health/readiness`
- **Liveness Check Endpoint**: `http://localhost:5000/api/health/liveness`

---

## 4. SSL Certificate Setup (Let's Encrypt & Certbot)

Install Certbot for automated HTTPS encryption:
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d skillbridge.ai -d www.skillbridge.ai
```

Certbot will automatically patch `/etc/nginx/nginx.conf` and schedule auto-renewals.

---

## 5. Database Backup & Disaster Recovery

### Create Database Snapshot Backup:
```bash
docker exec skillbridge-mongodb mongodump --db skillbridge --out /data/db/backup_$(date +%F)
```

### Restore Database Snapshot:
```bash
docker exec skillbridge-mongodb mongorestore --db skillbridge /data/db/backup_2026-08-05/skillbridge
```

---

## 6. Logs & Telemetry Monitoring
- **Backend Logs**: `docker-compose logs -f server`
- **AI Microservice Logs**: `docker-compose logs -f ai-service`
- **Nginx Access Logs**: `docker-compose logs -f nginx`
