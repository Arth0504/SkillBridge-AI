# SkillBridge AI Enterprise Security Architecture Policy & Hardening Manual

This document outlines the enterprise security controls, architecture, and defense-in-depth mechanisms implemented across the SkillBridge AI platform to protect candidate PII, recruiter data, real-time WebRTC video interviews, and automated HRMS operations.

---

## 1. Authentication & Session Management
- **JSON Web Tokens (JWT)**: Cryptographically signed Bearer tokens with short lifetime expiration (15 minutes).
- **Secure HttpOnly Cookies**: Refresh tokens are stored in `HttpOnly`, `SameSite` cookies to prevent XSS script access.
- **Refresh Token Rotation & Revocation**: Active sessions and refresh token hashes are persisted in MongoDB `Session` collection allowing single-device or all-device logout.
- **Account Lockout Brute-Force Protection**: 5 consecutive invalid login attempts automatically trigger a **30-minute account lockout** (`lockUntil`) on candidate and recruiter accounts.

---

## 2. Role-Based Access Control (RBAC) & Ownership Protection
- **Role Enforcement**: Routes are strictly guarded by `protect` and `restrictTo(allowedRoles)` middleware layer (`candidate`, `company`, `admin`, `super-admin`).
- **Resource Ownership Verification**: API handlers explicitly verify document ownership (`companyId` vs `req.user.companyId`, `candidateId` vs `req.user._id`) before granting read/write access.
- **Broken Access Control Prevention**: Candidates are blocked from company and admin endpoints; recruiters cannot modify admin system records.

---

## 3. Rate Limiting & Denial of Service Defense
- **Global Rate Limiter**: Limits general API traffic to 100 requests per 15-minute window per IP.
- **Auth Endpoint Limiter**: Restricts `/api/v1/auth` (login, register, reset password, OTP) to 10 requests per 15 minutes.
- **AI Microservice Limiter**: Restricts AI Resume Analyzer, AI Mock Interview, AI Coding Assessment, and Recruiter Copilot to 30 requests per 15 minutes.
- **File Upload Limiter**: Caps resume and media file uploads to 20 uploads per 15 minutes.

---

## 4. HTTP Security Headers (Helmet) & CORS Policy
- **HTTP Strict Transport Security (HSTS)**: Enforces HTTPS connections with `maxAge: 31536000`, `includeSubDomains: true`, and `preload: true`.
- **Referrer Policy**: Enforces `strict-origin-when-cross-origin`.
- **Frameguard & Clickjacking Defense**: Enforces `X-Frame-Options: DENY`.
- **Content Type Options**: Enforces `X-Content-Type-Options: nosniff`.
- **CORS Whitelist Enforcement**: Restricts cross-origin requests exclusively to validated domains (`CLIENT_URL` and authorized origins).

---

## 5. Input Sanitization & Anti-Injection Protection
- **NoSQL Injection Sanitization**: Uses `express-mongo-sanitize` to strip `$` and `.` operators from request bodies, parameters, and query strings.
- **XSS Script Sanitization**: `sanitizeInputs` recursively strips `<script>`, `<iframe>`, event handlers (`onerror`, `onload`, `onclick`, `onmouseover`), `javascript:` URIs, and `eval()` execution calls.
- **MongoDB ObjectId Validation**: Request parameters undergo regex hex string verification before database queries execute.

---

## 6. Secure File Upload & Media Handling
- **Dual MIME + Extension Verification**: Verifies both MIME header and filename extension. Resumes must be `.pdf` format (max 5MB); avatars must be `.jpg`, `.jpeg`, `.png`, or `.webp` (max 2MB).
- **Executable & Path Traversal Blacklist**: Rejects filenames containing `..`, `/`, `\` or forbidden executable extensions (`.exe`, `.sh`, `.bat`, `.cmd`, `.js`, `.py`, `.php`, `.jar`, `.vbs`).

---

## 7. Audit Logging & Security Event Retention
- **Centralized Audit Trail**: `AuditLog` collection captures logins, logouts, password changes, uploads, interview start/end, onboarding events, and admin actions.
- **2-Year TTL Retention**: Automated MongoDB TTL index purges logs after 730 days (`expires: '730d'`).
- **Data Protection**: Passwords, raw JWTs, refresh tokens, and API secret keys are strictly masked and never stored in audit logs.

---

## 8. Reverse Proxy & Infrastructure Protection
- **Express Trust Proxy**: `app.set('trust proxy', 1)` enables accurate real client IP tracking behind reverse proxies (Nginx, Render, Railway, Cloudflare).
- **Docker Non-Root Security**: Containers execute under `USER node` non-root privileges with automated runtime `HEALTHCHECK` directives.
- **Zero Hardcoded Secrets**: Secrets are injected via environment variables (`.env`).
