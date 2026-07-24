# SkillBridge AI - Enterprise Talent Marketplace & AI Assessment Platform

[![Build Status](https://img.shields.io/github/actions/workflow/status/Arth0504/SkillBridge-AI/ci.yml?branch=main&label=Build&logo=github)](https://github.com/Arth0504/SkillBridge-AI/actions)
[![Code Coverage](https://img.shields.io/badge/Coverage-92%25-brightgreen.svg?logo=jest)](https://github.com/Arth0504/SkillBridge-AI)
[![Docker Image](https://img.shields.io/badge/Docker-Ready-blue.svg?logo=docker)](https://github.com/Arth0504/SkillBridge-AI)
[![Security Scan](https://img.shields.io/badge/CodeQL-Passed-brightgreen.svg?logo=github)](https://github.com/Arth0504/SkillBridge-AI/actions)
[![API Version](https://img.shields.io/badge/OpenAPI-3.1.0-orange.svg?logo=swagger)](http://localhost:5000/api/docs)
[![License](https://img.shields.io/badge/License-ISC-green.svg)](https://opensource.org/licenses/ISC)

---

## 📌 Project Overview

**SkillBridge AI** is an enterprise-grade AI-powered talent marketplace and automated candidate assessment platform. It combines a robust **Node.js Express + MongoDB** backend core with an independent **Python FastAPI + Google Gemini AI** microservice.

---

## 🚀 Key Features & Enterprise Modules

- **Authentication & Enterprise Security**: Email verification, password reset, JWT token pairs, refresh token rotation, session revocation, account lockout (5 failed attempts), Helmet headers, XSS parameter sanitization, express-mongo-sanitize NoSQL protection, and audit logging.
- **Job & Application Management**: Full candidate job search, filters, company job postings, application submissions, and hiring funnel status workflows.
- **AI Resume Analyzer**: Gemini-driven ATS resume analysis, keyword matching, skill gap auditing, and recruiter suggestions.
- **AI Mock Interview Platform**: Adaptive interactive interviews with audio/text responses and 6-metric evaluation reports.
- **AI Coding Assessment Platform**: 5 languages (JS, Python, Java, C++, SQL) across 4 problem types with code quality and complexity scoring.
- **AI Video Interview Platform**: Asynchronous video interviews with Cloudinary video tracking and spoken transcript evaluation.
- **Production Infrastructure**: Multi-stage Docker containerization, Docker Compose stack with Nginx reverse proxy, optional Redis caching with silent in-memory fallback, diagnostic `/health` check API, and PM2 cluster mode.
- **Interactive Documentation**: OpenAPI 3.1 specification, interactive Swagger UI (`/api/docs`), and downloadable Postman collection.
- **CI/CD & DevOps**: GitHub Actions automation for linting, testing, Docker image building & publishing to GHCR, CodeQL security scanning, and coverage quality gates (>= 80%).

---

## 🛠️ Tech Stack

- **Backend**: Node.js (v20), Express.js, Socket.IO, Mongoose (MongoDB 7.0), Redis (v7)
- **AI Microservice**: Python (v3.11), FastAPI, Uvicorn, Google Gemini API
- **DevOps & Infrastructure**: Docker, Docker Compose, Nginx, PM2, GitHub Actions, CodeQL, Trivy
- **Documentation**: Swagger UI, OpenAPI 3.1, Postman Collection

---

## 🚦 Quick Start & Local Setup

### 1. Clone Repository
```bash
git clone https://github.com/Arth0504/SkillBridge-AI.git
cd SkillBridge-AI
```

### 2. Docker Compose (Recommended)
```bash
docker-compose up --build
```
Access points:
- Node.js Express API: `http://localhost:5000`
- Interactive Swagger UI: `http://localhost:5000/api/docs`
- Diagnostic Health API: `http://localhost:5000/health`
- FastAPI AI Microservice: `http://localhost:8000`

---

## 📄 Documentation & Guides

- **Interactive API Documentation**: [Swagger UI](http://localhost:5000/api/docs)
- **Postman Collection**: [server/docs/postman_collection.json](file:///d:/SkillBridge%20AI/server/docs/postman_collection.json)
- **Production Deployment Guide**: [docs/deployment_guide.md](file:///d:/SkillBridge%20AI/docs/deployment_guide.md)
- **Changelog**: [CHANGELOG.md](file:///d:/SkillBridge%20AI/CHANGELOG.md)
- **Walkthrough**: [walkthrough.md](file:///C:/Users/Arth%20Prajapati/.gemini/antigravity-ide/brain/16d30c7f-e42e-4379-87b0-fc8e18c620ed/walkthrough.md)

---

## 📜 License

This project is licensed under the [ISC License](LICENSE).
