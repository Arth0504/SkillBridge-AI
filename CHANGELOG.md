# Changelog

All notable changes to the **SkillBridge AI** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-07-24

### Added
- **Core Backend Infrastructure**: Complete Node.js Express REST API platform with MongoDB Mongoose schemas, JWT Access & Refresh Token pair authentication, and Socket.IO notification gateway.
- **Candidate & Company Modules**: Profile management, skills audit, work experience, education, resume upload, public job search, job posting management, and application pipelines.
- **AI Microservice**: Independent FastAPI Python microservice powered by Google Gemini API for ATS Resume Analysis, Job Match Auditing, Adaptive Mock Interviews, Coding Assessments, and Asynchronous Video Interviews.
- **Enterprise Security Suite**: 20 Security controls including Account Lockout (5 failed attempts -> 15m lock), Refresh Token Rotation with Security Breach Detection, Audit Logging (`AuditLog` model), Active Session tracking (`Session` model), Helmet Security Headers, XSS parameter sanitization, and express-mongo-sanitize NoSQL injection protection.
- **Enterprise API Documentation**: Complete OpenAPI 3.1 specification, interactive Swagger UI mounted at `/api/docs` and `/api/v1/docs`, JWT Authorize button, error documentation (400, 401, 403, 404, 409, 422, 423, 429, 500), and downloadable Postman collection.
- **Production Infrastructure**: Multi-stage Dockerfiles for Node.js, FastAPI, and React Frontend; Docker Compose stack with Nginx reverse proxy, MongoDB, and Redis; optional Redis cache with silent in-memory fallback; diagnostic `/health` check API; graceful shutdown handling (`SIGINT`/`SIGTERM`); PM2 ecosystem config; and multi-cloud deployment guides.
- **CI/CD Pipeline & Quality Engineering**: GitHub Actions workflows (`ci.yml`, `cd.yml`, `security.yml`, `quality.yml`), ESLint, Prettier, Commitlint, Husky pre-commit hooks, CodeQL SAST, Trivy vulnerability scanner, code coverage quality gates, and status badges.
