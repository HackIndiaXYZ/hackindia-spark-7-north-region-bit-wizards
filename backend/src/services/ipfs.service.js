const fs   = require("fs");
const path = require("path");

/**
 * Uploads a file to Pinata (IPFS) and returns the resulting CID.
 * Builds the multipart body manually as raw Buffers to avoid any
 * form-data library compatibility issues.
 *
 * @param {string} filePath - Path to the local file on disk.
 * @param {string} title    - Name stored as Pinata metadata.
 * @returns {Promise<string>} IPFS CID (IpfsHash from Pinata response).
 */
const uploadToIPFS = async (filePath, title) => {
  const { PINATA_API_KEY, PINATA_SECRET_API_KEY: PINATA_SECRET } = process.env;

  if (!PINATA_API_KEY || !PINATA_SECRET) {
    throw new Error("Pinata API credentials are missing from .env");
  }

  const fileBuffer = fs.readFileSync(filePath);
  const fileName   = path.basename(filePath);
  console.log(`📤 Uploading to Pinata — file: ${fileName}, size: ${fileBuffer.length} bytes`);

  const boundary = "----PinataFormBoundary" + Date.now();

  // Build a plain text form field
  const textField = (name, value) =>
    `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`;

  const filePart = Buffer.concat([
    Buffer.from(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n` +
      `Content-Type: application/octet-stream\r\n\r\n`
    ),
    fileBuffer,
    Buffer.from("\r\n"),
  ]);

  const body = Buffer.concat([
    filePart,
    Buffer.from(textField("pinataMetadata", JSON.stringify({ name: title || "evidence" }))),
    Buffer.from(textField("pinataOptions",  JSON.stringify({ cidVersion: 1 }))),
    Buffer.from(`--${boundary}--\r\n`),
  ]);

  const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      "Content-Type":          `multipart/form-data; boundary=${boundary}`,
      "Content-Length":        body.length,
      pinata_api_key:          PINATA_API_KEY,
      pinata_secret_api_key:   PINATA_SECRET,
    },
    body,
  });

  const result = await response.json();
  console.log("📥 Pinata response:", JSON.stringify(result));

  if (!response.ok) {
    throw new Error(`Pinata upload failed: ${result.error?.reason || JSON.stringify(result)}`);
  }

  return result.IpfsHash;
};

module.exports = { uploadToIPFS };
