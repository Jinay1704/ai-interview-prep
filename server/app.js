import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler } from "./middleware/errorHandler.js";
import router from "./routes/index.js";

const app = express();

// ── Security & logging ───────────────────────────────────────
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ── CORS ─────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  "https://your-frontend.onrender.com"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// ── Body parsers ─────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ───────────────────────────────────────────────────
app.use("/api", router);

// ── Health check ─────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// ── Global error handler ─────────────────────────────────────
app.use(errorHandler);

export default app;
