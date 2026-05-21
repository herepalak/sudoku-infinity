# 🚀 Sudoku Infinity — Complete Deployment Guide

## ⚡ LOCAL SETUP (5 minutes)

### Prerequisites
- Java 17+: `java --version`
- Node.js 18+: `node --version`
- PostgreSQL running locally OR Docker

### Step 1 — Database
```bash
# Docker (easiest):
docker run -d --name sudoku-pg -e POSTGRES_DB=sudokuinfinity \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 postgres:16-alpine
```

### Step 2 — Backend
```bash
cd backend
./mvnw spring-boot:run
# Starts at http://localhost:8080, auto-creates tables + seeds story levels
```

### Step 3 — Frontend
```bash
cd frontend
npm install
cp .env.example .env          # VITE_API_URL=http://localhost:8080
npm run dev
# Open http://localhost:5173
```

---

## 🌐 DEPLOY LIVE (Free URLs)

### 1. Push to GitHub
```bash
git init && git add . && git commit -m "Sudoku Infinity v1"
git remote add origin https://github.com/YOUR_USER/sudoku-infinity.git
git push -u origin main
```

### 2. Backend → Railway.app
1. railway.app → New Project → GitHub → select repo
2. Set **Root Directory** = `backend`
3. Add **PostgreSQL plugin** (auto-injects DATABASE_URL)
4. Set Variables:
   - `JWT_SECRET` = any long random string (64+ chars)
   - `CORS_ORIGINS` = (your Vercel URL, set after step 3)
   - `PORT` = 8080
5. Deploy → get URL like `https://xxx.railway.app`

### 3. Frontend → Vercel
1. vercel.com → New Project → GitHub → select repo
2. **Root Directory** = `frontend`, Framework = Vite
3. Set Variable: `VITE_API_URL` = your Railway URL (no trailing slash)
4. Deploy → get URL like `https://sudoku-infinity.vercel.app`
5. **Go back to Railway** → update `CORS_ORIGINS` to your Vercel URL → Redeploy

✅ Your game is live!

---

## 🎮 Features
- 6 Difficulties (Easy → Legend)
- Infinite procedural levels (never ends)
- Story Mode — 20 levels, 4 chapters, with lore
- Daily Challenge + Global Leaderboard
- Battle Mode vs AI
- 5 Power-Ups (Reveal, Clear Errors, X-Ray, Auto Notes)
- AI Hint Engine (explains strategy)
- Note/Pencil Mark mode
- 4 Themes (Neon, Classic, Matrix, Zen)
- XP + Level system, 10+ Achievements
- S/A/B/C/D Performance Rating
- Auto-save every 30 seconds
- Full keyboard support

## 🏗️ Tech Stack
| | Technology |
|---|---|
| Frontend | React 18, Vite, Zustand, Framer Motion |
| Backend | Spring Boot 3.2, Java 17, PostgreSQL |
| Auth | JWT |
| Deploy | Vercel (FE) + Railway (BE) |
