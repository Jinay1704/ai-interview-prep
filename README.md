# AI Mock Interview — MERN Stack

Full-stack AI-powered mock interview platform.

## Stack
- **Frontend**: React 18 + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express
- **Database**: MongoDB + Mongoose
- **Auth**: Clerk (JWT + Webhooks)
- **AI**: Google Gemini API (questions, feedback, resume analysis)
- **Voice**: Hume AI (voice interview)

## Quick Start

```bash
# 1. Clone and install
cd server && npm install
cd ../client && npm install

# 2. Set env vars
cp .env.example server/.env
cp .env.example client/.env   # only VITE_ vars needed

# 3. Run dev
cd server && npm run dev      # :5000
cd client && npm run dev      # :5173
```
