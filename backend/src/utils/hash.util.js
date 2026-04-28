
// ─── 1. Import crypto ─────────────────────────────────────────────────────────
// crypto is built into Node.js — no need to install
// It provides cryptographic functions like hashing
const crypto = require("crypto");

// ─── 2. Import fs ─────────────────────────────────────────────────────────────
// fs = File System — lets us read files from disk
const fs = require("fs");

// ─── 3. The main function ─────────────────────────────────────────────────────
// generateSHA256 takes a file path (string) and returns a hash (string)
// Example input:  "uploads/1718000000000.pdf"
// Example output: "e3b0c44298fc1c149afb...abc"
const generateSHA256 = (filePath) => {
  
  // Read the entire file into memory as raw bytes (a Buffer)
  // fs.readFileSync = reads the file RIGHT NOW, not asynchronously
  const fileBuffer = fs.readFileSync(filePath);

  // Create a SHA-256 hash object
  // Think of it as an empty blender for hashing
  const hashSum = crypto.createHash("sha256");

  // Feed the file's bytes into the hash object
  // "update" means: "add this data to what you're hashing"
  hashSum.update(fileBuffer);

  // Finalize and get the result as a hex string
  // "hex" = hexadecimal format (letters a-f + digits 0-9)
  // This is the standard format you'll see hashes in
  const hex = hashSum.digest("hex");

  return hex;
};

// ─── 4. Export ────────────────────────────────────────────────────────────────
module.exports = { generateSHA256 };