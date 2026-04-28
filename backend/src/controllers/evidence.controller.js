const fs                   = require("fs");
const { storeOnBlockchain } = require("../services/blockchain.service");
const Evidence              = require("../models/evidence.model");
const { generateSHA256 }   = require("../utils/hash.util");
const { uploadToIPFS }     = require("../services/ipfs.service");

// ════════════════════════════════════════════════════════════════════════════
// CONTROLLER 1: uploadEvidence
// Route: POST /api/evidence/upload
// ════════════════════════════════════════════════════════════════════════════
const uploadEvidence = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded. Use form-data with key 'evidence'.",
      });
    }

    const title    = req.body.title    || "Untitled Evidence";
    // ✅ FIX: read category from request body and save it
    const category = req.body.category || "Other";
    const filePath = req.file.path;

    // Generate SHA-256
    const sha256 = generateSHA256(filePath);
    console.log(`🔐 SHA-256: ${sha256}`);

    // Duplicate check BEFORE upload
    const exists = await Evidence.findOne({ sha256 });
    if (exists) {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: "Evidence already exists. This file has already been registered.",
      });
    }

    // Upload to IPFS
    const ipfsCid = await uploadToIPFS(filePath, title);
    console.log(`📦 IPFS CID: ${ipfsCid}`);

    // Store on blockchain
    const hashBytes32 = "0x" + sha256;
    const txHash      = await storeOnBlockchain(hashBytes32, ipfsCid, 0);
    console.log("⛓ Blockchain TX:", txHash);

    // Save to MongoDB — ✅ category and txHash included
    const saved = await Evidence.create({
      title,
      sha256,
      ipfsCid,
      ipfsUrl: `https://gateway.pinata.cloud/ipfs/${ipfsCid}`,
      txHash,
      category,   // ✅ persisted
      originalName: req.file.originalname,
    });
    console.log("✅ Saved to MongoDB:", saved._id);

    // Clean up temp file
    fs.unlinkSync(filePath);

    // ✅ FIX: return txHash, category in response so frontend can display them
    return res.status(201).json({
      success: true,
      data: {
        sha256:       saved.sha256,
        ipfsCid:      saved.ipfsCid,
        ipfsUrl:      saved.ipfsUrl,
        txHash:       saved.txHash,       // ✅ returned to frontend
        title:        saved.title,
        category:     saved.category,     // ✅ returned to frontend
        uploadedAt:   saved.uploadedAt,
        originalName: saved.originalName,
      },
    });

  } catch (error) {
    console.error("❌ Upload Error:", error);
    next(error);
  }
};

// ════════════════════════════════════════════════════════════════════════════
// CONTROLLER 2: getAllEvidence
// Route: GET /api/evidence
// ════════════════════════════════════════════════════════════════════════════
const getAllEvidence = async (req, res) => {
  try {
    const data = await Evidence.find().sort({ uploadedAt: -1 });
    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// CONTROLLER 3: verifyEvidenceFile
// Route: POST /api/evidence/verify
// ════════════════════════════════════════════════════════════════════════════
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
      data:     existing || null,
      message:  existing
        ? "✅ File is authentic (found in DB)"
        : "❌ File not found or tampered",
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { uploadEvidence, getAllEvidence, verifyEvidenceFile };
