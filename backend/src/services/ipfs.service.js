// src/services/ipfs.service.js

const fs   = require("fs");
const path = require("path");

const uploadToIPFS = async (filePath, title) => {

  const PINATA_API_KEY = process.env.PINATA_API_KEY;
  const PINATA_SECRET  = process.env.PINATA_SECRET_API_KEY;

  if (!PINATA_API_KEY || !PINATA_SECRET) {
    throw new Error("Pinata API credentials are missing from .env");
  }

  // ── Read file as Buffer ───────────────────────────────────────────────────
  const fileBuffer = fs.readFileSync(filePath);
  const fileName   = path.basename(filePath);
  const fileSize   = fileBuffer.length;

  console.log("📤 Uploading to Pinata...");
  console.log("📄 File:", fileName, "| Size:", fileSize, "bytes");

  // ── Build boundary manually ───────────────────────────────────────────────
  // We build the multipart/form-data body ourselves using plain Buffers
  // This avoids any compatibility issues between form-data package and fetch
  const boundary = "----PinataFormBoundary" + Date.now();

  // ── Helper to create a form field (text) ─────────────────────────────────
  const textField = (name, value) =>
    `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`;

  // ── Build each part as a Buffer ───────────────────────────────────────────
  const filePart = Buffer.concat([
    // Part header
    Buffer.from(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n` +
      `Content-Type: application/octet-stream\r\n\r\n`
    ),
    // Actual file bytes
    fileBuffer,
    // End of this part
    Buffer.from("\r\n"),
  ]);

  const metadataPart = Buffer.from(
    textField("pinataMetadata", JSON.stringify({ name: title || "evidence" }))
  );

  const optionsPart = Buffer.from(
    textField("pinataOptions", JSON.stringify({ cidVersion: 1 }))
  );

  const closingBoundary = Buffer.from(`--${boundary}--\r\n`);

  // ── Combine all parts into one Buffer ─────────────────────────────────────
  const bodyBuffer = Buffer.concat([
    filePart,
    metadataPart,
    optionsPart,
    closingBoundary,
  ]);

  // ── Send to Pinata ────────────────────────────────────────────────────────
  const response = await fetch(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    {
      method: "POST",
      headers: {
        "Content-Type":          `multipart/form-data; boundary=${boundary}`,
        "Content-Length":        bodyBuffer.length,
        pinata_api_key:          PINATA_API_KEY,
        pinata_secret_api_key:   PINATA_SECRET,
      },
      body: bodyBuffer,
    }
  );

  const result = await response.json();
  console.log("📥 Pinata response:", JSON.stringify(result));

  if (!response.ok) {
    throw new Error(
      `Pinata upload failed: ${result.error?.reason || JSON.stringify(result)}`
    );
  }

  return result.IpfsHash;
};

module.exports = { uploadToIPFS };