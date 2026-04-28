const router = require("express").Router();
const upload = require("../middlewares/upload.middleware");
const {
  uploadEvidence,
  getAllEvidence,
  verifyEvidenceFile,
} = require("../controllers/evidence.controller");

router.get("/",              getAllEvidence);
router.post("/upload",  upload.single("evidence"), uploadEvidence);
router.post("/verify",  upload.single("file"),     verifyEvidenceFile);

module.exports = router;
