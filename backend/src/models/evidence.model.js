const mongoose = require("mongoose");

const evidenceSchema = new mongoose.Schema({
  title:        { type: String, required: true },
  sha256:       { type: String, required: true, unique: true },
  ipfsCid:      { type: String, required: true },
  ipfsUrl:      { type: String, required: true },
  txHash:       { type: String },           // ✅ blockchain tx hash
  category:     { type: String, default: "Other" }, // ✅ needed for Timeline badge
  uploadedAt:   { type: Date, default: Date.now },
  originalName: String,
});

module.exports = mongoose.model("Evidence", evidenceSchema);
