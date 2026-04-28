const mongoose = require("mongoose");

const evidenceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  sha256: {
  type: String,
  required: true,
  unique: true, // 🚨 THIS PREVENTS DUPLICATES FOREVER
}
,
  ipfsCid: { type: String, required: true },
  ipfsUrl: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  originalName: String,
});

module.exports = mongoose.model("Evidence", evidenceSchema);
