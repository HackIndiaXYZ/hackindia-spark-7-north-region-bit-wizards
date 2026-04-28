const crypto = require("crypto");
const fs     = require("fs");

/**
 * Reads a file from disk and returns its SHA-256 hash as a hex string.
 * @param {string} filePath - Absolute or relative path to the file.
 * @returns {string} 64-character hex digest.
 */
const generateSHA256 = (filePath) => {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(fileBuffer).digest("hex");
};

module.exports = { generateSHA256 };
