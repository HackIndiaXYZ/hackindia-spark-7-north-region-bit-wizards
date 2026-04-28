
// ─── 1. Import multer ─────────────────────────────────────────────────────────
// multer handles multipart/form-data requests (which is how files are sent)
const multer = require("multer");

// ─── 2. Import path ───────────────────────────────────────────────────────────
// path is built into Node.js — helps us work with file paths safely
const path = require("path");

// ─── 3. Define where to store uploaded files ──────────────────────────────────
// multer.diskStorage() tells multer: "save files to disk (not memory)"
const storage = multer.diskStorage({
  
  // destination: which folder to save the file in
  destination: function (req, file, cb) {
    // cb = callback. First argument is error (null = no error), second is folder
    cb(null, "uploads/"); // saves in the /uploads folder we created
  },

  // filename: what to name the saved file
  filename: function (req, file, cb) {
    // We create a unique name: timestamp + original extension
    // Example: 1718000000000.pdf
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

// ─── 4. File type filter ──────────────────────────────────────────────────────
// We don't want users uploading .exe or .zip files
// This function checks the file type BEFORE saving it
const fileFilter = function (req, file, cb) {
  // List of allowed MIME types
  // MIME type = the type label of a file, e.g. "image/jpeg", "video/mp4"
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/quicktime",
    "application/pdf",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    // File type is allowed → accept it (true = accept)
    cb(null, true);
  } else {
    // File type is NOT allowed → reject with an error
    cb(new Error("❌ Invalid file type. Only images, videos, and PDFs allowed."), false);
  }
};

// ─── 5. Create the multer instance ────────────────────────────────────────────
// Combine storage + file filter + size limit into one multer config
const upload = multer({
  storage: storage,       // use disk storage defined above
  fileFilter: fileFilter, // use the type filter above
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    // 10 * 1024 * 1024 = 10,485,760 bytes = 10 MB
  },
});

// ─── 6. Export ────────────────────────────────────────────────────────────────
// We export `upload` so our routes/controllers can use it
module.exports = upload;