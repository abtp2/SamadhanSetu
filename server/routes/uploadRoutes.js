const express = require('express');
const multer = require('multer');
const router = express.Router();
const { uploadImage, getUploadConfig } = require('../controllers/uploadController');
const { optionalAuth } = require('../middleware/auth');

// Multer memory storage configuration (passes buffer directly to Cloudinary upload_stream)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB max file size
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP, etc.) are allowed!'), false);
    }
  },
});

// Single image upload via form-data (fields 'image' or 'file')
router.post(
  '/',
  optionalAuth,
  upload.fields([{ name: 'image', maxCount: 1 }, { name: 'file', maxCount: 1 }]),
  (req, res, next) => {
    // Flatten req.file for controller
    if (req.files) {
      if (req.files.image && req.files.image[0]) req.file = req.files.image[0];
      else if (req.files.file && req.files.file[0]) req.file = req.files.file[0];
    }
    next();
  },
  uploadImage
);

router.get('/config', getUploadConfig);

module.exports = router;
