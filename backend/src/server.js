const fs   = require("fs");
const path = require("path");

// Ensure the uploads directory exists before anything else runs
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const app       = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`✅ Server running  → http://localhost:${PORT}`);
  console.log(`🔍 Health check   → http://localhost:${PORT}/api/health`);
});
