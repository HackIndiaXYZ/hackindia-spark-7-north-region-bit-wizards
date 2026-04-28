const mongoose = require("mongoose");

const evidenceSchema = new mongoose.Schema({
  title:        { type: String, required: true },
  sha256:       { type: String, required: true, unique: true },
  ipfsCid:      { type: String, required: true },
  ipfsUrl:      { type: String, required: true },
  txHash:       { type: String },
  category:     { type: String, default: "Other" },
  originalName: { type: String },
  uploadedAt:   { type: Date,   default: Date.now },
});

module.exports = mongoose.model("Evidence", evidenceSchema);
