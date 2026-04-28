const fs                    = require("fs");
const Evidence              = require("../models/evidence.model");
const { generateSHA256 }    = require("../utils/hash.util");
const { uploadToIPFS }      = require("../services/ipfs.service");
const { storeOnBlockchain } = require("../services/blockchain.service");

// ── POST /api/evidence/upload ─────────────────────────────────────────────────
const uploadEvidence = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded. Use form-data with key 'evidence'.",
      });
    }

    const title    = req.body.title    || "Untitled Evidence";
    const category = req.body.category || "Other";
    const filePath = req.file.path;

    // Hash the file
    const sha256 = generateSHA256(filePath);
    console.log(`🔐 SHA-256: ${sha256}`);

    // Reject duplicates before touching IPFS or the blockchain
    const duplicate = await Evidence.findOne({ sha256 });
    if (duplicate) {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: "Evidence already exists. This file has already been registered.",
      });
    }

    // Upload to IPFS
    const ipfsCid = await uploadToIPFS(filePath, title);
    console.log(`📦 IPFS CID: ${ipfsCid}`);

    // Record on blockchain
    const txHash = await storeOnBlockchain("0x" + sha256, ipfsCid, 0);
    console.log("⛓  Blockchain TX:", txHash);

    // Persist to MongoDB
    const saved = await Evidence.create({
      title,
      sha256,
      ipfsCid,
      ipfsUrl:      `https://gateway.pinata.cloud/ipfs/${ipfsCid}`,
      txHash,
      category,
      originalName: req.file.originalname,
    });
    console.log("✅ Saved to MongoDB:", saved._id);

    // Remove the temp file now that we're done with it
    fs.unlinkSync(filePath);

    return res.status(201).json({
      success: true,
      data: {
        sha256:       saved.sha256,
        ipfsCid:      saved.ipfsCid,
        ipfsUrl:      saved.ipfsUrl,
        txHash:       saved.txHash,
        title:        saved.title,
        category:     saved.category,
        uploadedAt:   saved.uploadedAt,
        originalName: saved.originalName,
      },
    });
  } catch (err) {
    console.error("❌ Upload Error:", err);
    next(err);
  }
};

// ── GET /api/evidence ─────────────────────────────────────────────────────────
const getAllEvidence = async (_req, res) => {
  try {
    const data = await Evidence.find().sort({ uploadedAt: -1 });
    return res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/evidence/verify ─────────────────────────────────────────────────
const verifyEvidenceFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded for verification.",
      });
    }

    const hash     = generateSHA256(req.file.path);
    const existing = await Evidence.findOne({ sha256: hash });
    fs.unlinkSync(req.file.path);

    return res.status(200).json({
      verified: !!existing,
      data:     existing || null,
      message:  existing
        ? "✅ File is authentic (found in DB)"
        : "❌ File not found or tampered",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadEvidence, getAllEvidence, verifyEvidenceFile };
