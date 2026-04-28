require("dotenv").config();

const express        = require("express");
const cors           = require("cors");
const evidenceRoutes = require("./routes/evidence.routes");

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin:  process.env.FRONTEND_URL || "http://localhost:3000",
  methods: ["GET", "POST"],
}));

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => res.status(200).json({ status: "OK" }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/evidence", evidenceRoutes);

// ── Global error handler ──────────────────────────────────────────────────────
// Must have 4 parameters so Express recognises it as an error handler.
app.use((err, _req, res, _next) => {
  console.error("❌ Global Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
