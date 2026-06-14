# MeCHAT — Connect. Chat. Create.

A production-ready, full-stack real-time chat application inspired by Discord, WhatsApp, Telegram, Slack, and Messenger.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express.js, Socket.IO |
| Database | MongoDB (Mongoose) |
| Auth | JWT + HTTP-only Cookies |
| Storage | Cloudinary |
| Deployment | Docker + Nginx |

## Features

- **Real-Time Messaging** — WebSocket-powered instant chat with typing indicators, read receipts, and reactions
- **Voice & Video Calls** — WebRTC-based peer-to-peer voice and video calls
- **MeAI Assistant** — Built-in AI assistant (OpenAI or built-in fallback)
- **Friend System** — Send/accept/reject friend requests, block users
- **Group Chats** — Create groups with roles (Owner/Admin/Moderator/Member), invite links
- **Admin Panel** — Full dashboard with analytics, user management, reports
- **Security** — JWT, bcrypt, rate limiting, helmet, XSS protection, mongo sanitization

## Quick Start

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in your credentials in .env
npm install
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:3000
Backend API: http://localhost:5000/api

### 3. Docker (Production)

```bash
docker-compose up -d
```

## Environment Variables

See `backend/.env.example` for all required variables.

Key variables:
- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — Strong random secret (min 32 chars in production)
- `CLOUDINARY_*` — Cloudinary credentials for file uploads
- `EMAIL_*` — SMTP credentials for email features
- `CLIENT_URL` — Frontend URL for CORS

## Project Structure

```
chat-app/
├── backend/
│   ├── config/         # DB, Cloudinary
│   ├── controllers/    # Auth, Users, Chat, Messages, Friends, Groups, AI, Admin
│   ├── middleware/     # Auth, Rate limiting
│   ├── models/         # 11 MongoDB models
│   ├── routes/         # REST API routes
│   ├── socket/         # Socket.IO real-time events
│   ├── utils/          # JWT, Email, Helpers
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── contexts/   # Socket, Theme
│   │   ├── pages/      # All pages
│   │   ├── services/   # API + Socket clients
│   │   └── store/      # Zustand state management
│   └── vite.config.js
├── docker-compose.yml
└── nginx.conf
```

## Security Features

- bcrypt password hashing (12 rounds)
- JWT with secure HTTP-only cookies
- Rate limiting (auth: 10/15min, messages: 60/min)
- Helmet.js security headers
- MongoDB injection prevention
- XSS protection
- CORS configured

---

MeCHAT © 2026 — Connect. Chat. Create.
