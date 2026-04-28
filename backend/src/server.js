const connectDB = require("./config/db");

// ─── 1. Import the configured app ─────────────────────────────────────────────
// app.js set everything up; now we just need to START it
const app = require("./app");

// ─── 2. Read PORT from .env (or default to 5000) ─────────────────────────────
// process.env.PORT comes from your .env file
// If it's not set, we fall back to 5000
const PORT = process.env.PORT || 5000;

// ─── 3. Start the server ──────────────────────────────────────────────────────
// app.listen() starts the HTTP server
// It keeps running and waits for incoming requests
connectDB();

app.listen(PORT, () => {
  // This callback runs once the server is successfully started
  console.log(`✅ Server is running on http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
});