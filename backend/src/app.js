const cors = require("cors");


// ─── 1. Load environment variables ───────────────────────────────────────────
// dotenv reads your .env file and makes variables like PINATA_API_KEY
// available anywhere via process.env.PINATA_API_KEY
require("dotenv").config();

// ─── 2. Import Express ────────────────────────────────────────────────────────
// Express is the framework that lets us create a web server easily
const express = require("express");

// ─── 3. Import our routes ─────────────────────────────────────────────────────
// We haven't written this yet, but we'll connect it here
const evidenceRoutes = require("./routes/evidence.routes");

// ─── 4. Create the Express app ────────────────────────────────────────────────
// Think of `app` as the actual web server object
const app = express();
app.use(cors());

// ─── 5. Built-in Middleware ───────────────────────────────────────────────────
// This tells Express: "if someone sends JSON in the request body, parse it"
// Example: { "title": "Breaking News" } in the body will now be readable
app.use(express.json());

// This tells Express: "also parse regular HTML form data"
// (not file uploads — that's multer's job)
app.use(express.urlencoded({ extended: true }));

// ─── 6. Health Check Route ────────────────────────────────────────────────────
// A simple route to confirm the server is alive
// When someone visits GET /api/health, they get { status: "OK" }
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// ─── 7. Connect Evidence Routes ───────────────────────────────────────────────
// Any request that starts with /api/evidence will be handled by evidenceRoutes
// Example: POST /api/evidence/upload → goes to evidence.routes.js
app.use("/api/evidence", evidenceRoutes);

// ─── 8. Global Error Handler ──────────────────────────────────────────────────
// If ANY route throws an error, it comes here instead of crashing the server
// The 4 parameters (err, req, res, next) tell Express this is an error handler
app.use((err, req, res, next) => {
  console.error("❌ Global Error:", err.message);

  // Send a clean error response to the client
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ─── 9. Export the app ────────────────────────────────────────────────────────
// We export `app` so that server.js can import it and start listening
module.exports = app;