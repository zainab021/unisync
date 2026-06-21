# UniSync — Deployment Guide

## Option 1: Railway.app (Recommended — Free, Auto HTTPS)

### Backend Deploy:
1. railway.app pe account banao
2. New Project → Deploy from GitHub
3. backend/ folder select karo
4. Environment Variables add karo:
   - PORT=5000
   - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
   - JWT_SECRET (strong random string)
   - EMAIL_USER, EMAIL_PASS
   - BACKUP_PIN
   - ALLOWED_ORIGINS=https://your-frontend-url.railway.app

### Frontend Deploy:
1. New Service → GitHub (university-portal/ folder)
2. Build Command: npm run build
3. Start Command: npm run preview
4. Environment Variable: VITE_API_URL=https://your-backend-url.railway.app

---

## Option 2: Render.com (Free tier available)

### Backend:
- New Web Service → Connect GitHub
- Root Directory: backend
- Build Command: npm install
- Start Command: node server.js

### Frontend:
- New Static Site
- Root Directory: university-portal
- Build Command: npm run build
- Publish Directory: dist

---

## Option 3: Local HTTPS (Development)

Install mkcert:
```bash
# Windows (chocolatey)
choco install mkcert
mkcert -install
mkcert localhost

# Then in vite.config.ts add:
# server: { https: { key: 'localhost-key.pem', cert: 'localhost.pem' } }
```

---

## After Deployment — Update .env:

```
ALLOWED_ORIGINS=https://your-domain.com
```

## Update frontend API URL:
In src/lib/auth.ts and all routes, change:
```
http://localhost:5000/api  →  https://your-backend.railway.app/api
```
