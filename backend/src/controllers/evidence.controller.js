const { storeOnBlockchain } = require("../services/blockchain.service");
const Evidence = require("../models/evidence.model");

// ─── 1. Imports ───────────────────────────────────────────────────────────────
const fs               = require("fs");
const { generateSHA256 } = require("../utils/hash.util");
const { uploadToIPFS }   = require("../services/ipfs.service");

// ─── 2. In-memory store ───────────────────────────────────────────────────────
// Since we have no database, we store evidence records in this array
// ⚠️ This resets every time the server restarts — that's okay for now

// ════════════════════════════════════════════════════════════════════════════════
// CONTROLLER 1: uploadEvidence
// Route: POST /api/evidence/upload
// What it does:
//   1. Receives the uploaded file (multer already saved it to /uploads)
//   2. Generates SHA-256 hash
//   3. Uploads file to IPFS via Pinata
//   4. Stores result in memory
//   5. Returns hash + CID to the client
// ════════════════════════════════════════════════════════════════════════════════
const uploadEvidence = async (req, res, next) => {
  try {
    // ── Step A: Check if a file was actually uploaded ─────────────────────────
    // multer puts the file info in req.file
    // If it's missing, the user forgot to attach a file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded. Use form-data with key 'evidence'.",
      });
    }

    // ── Step B: Get the title from request body ───────────────────────────────
    // req.body.title comes from the form field named "title"
    const title = req.body.title || "Untitled Evidence";

    // ── Step C: Get the file path where multer saved it ───────────────────────
    // req.file.path = "uploads/1718000000000.pdf"
    const filePath = req.file.path;

// ── Step D: Generate the SHA-256 hash ─────────────────────────────────────
const sha256 = generateSHA256(filePath);
console.log(`🔐 SHA-256: ${sha256}`);

// ✅ Step E: Check duplicate BEFORE upload
const exists = await Evidence.findOne({ sha256 });

if (exists) {
  fs.unlinkSync(filePath);

  return res.status(400).json({
    success: false,
    message: "Evidence already exists",
  });
}

// ── Step F: Upload to IPFS ONLY if not duplicate ──────────────────────────
const ipfsCid = await uploadToIPFS(filePath, title);

// convert hash to bytes32 format
const hashBytes32 = "0x" + sha256;

// 1. upload to IPFS (you already did this)

// 2. store on blockchain (NEW FIX)
const txHash = await storeOnBlockchain(hashBytes32, ipfsCid, 0);

console.log("⛓ Blockchain TX:", txHash);


console.log(`📦 IPFS CID: ${ipfsCid}`);

// ── Step G: Build record ──────────────────────────────────────────────────
const record = {

      title,
      sha256,
      ipfsCid,
      ipfsUrl: `https://gateway.pinata.cloud/ipfs/${ipfsCid}`,
      txHash,
      uploadedAt: new Date().toISOString(), // current timestamp
      originalName: req.file.originalname,  // e.g. "photo.jpg"
    };


    // ── Step G: Save to in-memory store ──────────────────────────────────────
    const saved = await Evidence.create(record);
console.log("✅ Saved to MongoDB:", saved);



    // ── Step H: Delete the temporary file from /uploads ──────────────────────
    // We don't need it anymore — it's already on IPFS
    // This keeps our server clean and saves disk space
    fs.unlinkSync(filePath);

    // ── Step I: Send success response ────────────────────────────────────────
    return res.status(201).json({
      success: true,
      data: {
        sha256: record.sha256,
        ipfsCid: record.ipfsCid,
        ipfsUrl: record.ipfsUrl,
        title: record.title,
        uploadedAt: record.uploadedAt,
      },
    });

  } catch (error) {
  console.error("❌ Upload Error:", error);
  next(error);
}

};

// ════════════════════════════════════════════════════════════════════════════════
// CONTROLLER 2: getAllEvidence
// Route: GET /api/evidence
// What it does: Returns all stored evidence records
// ════════════════════════════════════════════════════════════════════════════════
const getAllEvidence = async (req, res) => {
  const data = await Evidence.find().sort({ uploadedAt: -1 });

  return res.status(200).json({
    success: true,
    count: data.length,
    data,
  });
};

// ════════════════════════════════════════════════════════════════════════════════
// CONTROLLER 3: verifyEvidenceFile
// Route: POST /api/evidence/verify
// What it does:
//   1. Receives a file + an originalHash (provided by the user)
//   2. Re-hashes the uploaded file
//   3. Compares the new hash with the original
//   4. Returns valid: true/false
// ════════════════════════════════════════════════════════════════════════════════
const verifyEvidenceFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded for verification.",
      });
    }

    const newHash = generateSHA256(req.file.path);

    const existing = await Evidence.findOne({ sha256: newHash });

    fs.unlinkSync(req.file.path);

    return res.status(200).json({
      verified: !!existing,
      data: existing || null,
      message: existing
        ? "✅ File is authentic (found in DB)"
        : "❌ File not found / tampered",
    });

  } catch (error) {
    next(error);
  }
};


// ─── Export all three controllers ─────────────────────────────────────────────
module.exports = { uploadEvidence, getAllEvidence, verifyEvidenceFile };