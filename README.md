# 🎯 AI Interview Prep

An AI-powered mock interview platform that helps candidates practice technical and behavioral interviews through realistic recruiter interactions, voice-based conversations, and detailed performance analysis.

![React](https://img.shields.io/badge/Frontend-React-blue)
![Node.js](https://img.shields.io/badge/Backend-Node.js-green)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen)
![License](https://img.shields.io/badge/License-MIT-orange)
![Render](https://img.shields.io/badge/Deployment-Render-purple)

---

## 🚀 Live Demo

### Frontend
https://your-frontend-url.onrender.com

### Backend
https://your-backend-url.onrender.com

---

# 📌 Overview

AI Interview Prep is a full-stack MERN application designed to simulate real interview experiences using AI.

Candidates can:

- Practice job-specific interviews.
- Talk with an AI recruiter using voice.
- Upload resumes.
- Receive detailed feedback and ratings.
- Improve communication and interview confidence.

The platform aims to bridge the gap between theoretical preparation and real interview experiences.

---

# ✨ Features

## 🤖 AI Recruiter

- Dynamic recruiter-generated questions
- Natural interview flow
- Multiple interview rounds
- Technical and behavioral questions

---

## 🎤 Voice Interviews

- Microphone support
- Speech recognition
- Voice transcription
- Automatic recruiter responses
- Replay recruiter questions

---

## 🎥 Video Interviews (Planned)

- Candidate webcam support
- Video interview simulation
- Face visibility tracking
- Eye-contact analysis
- Presence evaluation

---

## 📄 Resume Upload

- Upload candidate resumes
- Resume parsing support
- Personalized interview generation

---

## 📊 Detailed Feedback

After completing interviews, candidates receive:

### Technical Assessment

- Accuracy
- Problem-solving ability
- Domain knowledge

### Communication Assessment

- Clarity
- Confidence
- Speaking pace
- Fluency

### Overall Evaluation

- Strengths
- Areas for improvement
- Final rating

---

## 🔐 Authentication

Powered by Clerk.

Features:

- Secure authentication
- Sign up/sign in
- Session management
- Protected routes

---

## 💳 Subscription Plans

Supports:

### Free

- Limited interviews
- Basic features

### Pro

- Unlimited interviews
- Enhanced feedback

### Enterprise

- Premium interview experience

---

# 🏗️ System Architecture

```
Client (React + Vite)
        │
        ▼
Backend API (Express.js)
        │
        ▼
MongoDB Atlas
        │
        ▼
External Services
├── Clerk
├── Gemini AI
├── Hume AI
└── Stream
```

---

# 🛠 Tech Stack

## Frontend

- React
- Vite
- React Router
- Clerk
- Axios
- Tailwind CSS
- Sonner

---

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Helmet
- Morgan
- CORS

---

## AI Services

### Gemini AI

Used for:

- Interview question generation
- Feedback generation

---

### Hume AI

Used for:

- Emotion detection
- Emotional intelligence insights

---

### Stream

Used for:

- Real-time communication capabilities

---

## Authentication

### Clerk

Used for:

- User authentication
- Session handling
- Webhooks

---

# 📂 Project Structure

```bash
ai-interview-prep/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── context/
│   │   └── App.jsx
│   │
│   └── package.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── app.js
│   ├── index.js
│   └── package.json
│
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/Jinay1704/ai-interview-prep.git

cd ai-interview-prep
```

---

# Backend Setup

```bash
cd server

npm install
```

Create `.env`

```env
MONGODB_URI=

CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

GEMINI_API_KEY=

HUME_API_KEY=
HUME_SECRET_KEY=

STREAM_API_KEY=
STREAM_SECRET_KEY=

CLIENT_URL=http://localhost:5173

NODE_ENV=development
```

Start backend:

```bash
npm run dev
```

Backend runs at:

```bash
http://localhost:5000
```

---

# Frontend Setup

```bash
cd client

npm install
```

Create `.env`

```env
VITE_CLERK_PUBLISHABLE_KEY=

VITE_API_BASE_URL=http://localhost:5000/api
```

Start frontend:

```bash
npm run dev
```

Frontend runs at:

```bash
http://localhost:5173
```

---

# 🌐 Deployment

## Frontend (Render)

### Build Command

```bash
npm install && npm run build
```

### Publish Directory

```bash
dist
```

Environment Variables:

```env
VITE_API_BASE_URL=
VITE_CLERK_PUBLISHABLE_KEY=
```

---

## Backend (Render)

### Build Command

```bash
npm install
```

### Start Command

```bash
npm start
```

Environment Variables:

```env
MONGODB_URI=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
GEMINI_API_KEY=
HUME_API_KEY=
HUME_SECRET_KEY=
STREAM_API_KEY=
STREAM_SECRET_KEY=
CLIENT_URL=
NODE_ENV=production
```

---

# 🔒 Security

This project follows several security practices:

- Helmet for HTTP security headers
- CORS protection
- Environment-based secrets
- Clerk authentication
- Protected backend routes

---

# 📈 Future Enhancements

Planned improvements include:

- Video interview mode
- AI-generated interview reports
- Facial expression analysis
- Eye-contact tracking
- Interview recording playback
- Recruiter personality selection
- Company-specific interview simulations
- PDF performance reports
- Leaderboards and analytics

---

# 🤝 Contributing

Contributions are welcome.

Steps:

```bash
Fork the repository

Create a feature branch

git checkout -b feature/feature-name

Commit changes

git commit -m "Add feature"

Push branch

git push origin feature/feature-name

Open a Pull Request
```

---

# 🐛 Reporting Issues

If any issues are found:

1. Open an issue.
2. Provide reproduction steps.
3. Include screenshots/logs if possible.

---

# 👨‍💻 Author

### Jinay Parmar

GitHub:

https://github.com/Jinay1704

---

# ⭐ Support

If this project helped in interview preparation, consider giving the repository a star.

It helps the project grow and motivates further development.

---

## License

This project is licensed under the MIT License.

Copyright © 2025 Jinay Parmar