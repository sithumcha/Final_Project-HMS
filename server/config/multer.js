const multer = require("multer");
const path = require("path");

// Set up Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Save files to the "uploads" directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Ensure unique filenames based on the timestamp
  },
});

// File filter to accept only images (optional)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image file'), false);
  }
};

// Multer instance with the storage configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,  // Maximum file size 5MB (optional)
  },
});

module.exports = upload;
