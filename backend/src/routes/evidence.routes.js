
// ─── 1. Import Express Router ─────────────────────────────────────────────────
// Router is a mini Express app — it handles routes for one section of your API
const router = require("express").Router();

// ─── 2. Import upload middleware ──────────────────────────────────────────────
// upload is our multer instance — it processes the file before the controller runs
const upload = require("../middlewares/upload.middleware");

// ─── 3. Import controllers ────────────────────────────────────────────────────
const {
  uploadEvidence,
  getAllEvidence,
  verifyEvidenceFile,
} = require("../controllers/evidence.controller");

// ─── 4. Define Routes ─────────────────────────────────────────────────────────

// GET /api/evidence
// Returns all stored evidence
// No middleware needed — just call the controller
router.get("/", getAllEvidence);

// POST /api/evidence/upload
// Flow: request → multer saves file → uploadEvidence controller runs
// upload.single("evidence") means:
//   - expect ONE file
//   - with the form-data key name "evidence"
router.post("/upload", upload.single("evidence"), uploadEvidence);

// POST /api/evidence/verify
// Flow: request → multer saves file → verifyEvidenceFile controller runs
// upload.single("file") means:
//   - expect ONE file
//   - with the form-data key name "file"
router.post("/verify", upload.single("file"), verifyEvidenceFile);

// ─── 5. Export the router ─────────────────────────────────────────────────────
module.exports = router;