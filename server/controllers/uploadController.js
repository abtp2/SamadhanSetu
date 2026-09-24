const fs = require('fs');
const path = require('path');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

// Ensure uploads directory exists for fallback
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Upload buffer to Cloudinary using upload_stream
 */
const uploadStreamToCloudinary = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'samadhansetu/challenges',
        resource_type: 'auto',
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

/**
 * POST /api/upload
 * Accepts multipart/form-data (field 'image' or 'file') OR JSON with base64 'image'
 */
const uploadImage = async (req, res) => {
  try {
    let fileBuffer = req.file ? req.file.buffer : null;
    let base64Data = req.body?.image || req.body?.dataUrl || null;

    if (!fileBuffer && !base64Data) {
      return res.status(400).json({
        success: false,
        message: 'No image file or base64 data provided in request.',
      });
    }

    // 1. Try uploading to Cloudinary if configured
    if (isCloudinaryConfigured()) {
      try {
        let result;
        if (fileBuffer) {
          result = await uploadStreamToCloudinary(fileBuffer);
        } else if (base64Data) {
          result = await cloudinary.uploader.upload(base64Data, {
            folder: 'samadhansetu/challenges',
            resource_type: 'auto',
          });
        }

        return res.status(200).json({
          success: true,
          url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
          provider: 'cloudinary',
          message: 'Image uploaded successfully to Cloudinary',
        });
      } catch (cloudErr) {
        console.error('[Cloudinary Upload Error]', cloudErr);
        // If Cloudinary failed due to bad credentials/network, proceed to local fallback so user action is not blocked
      }
    }

    // 2. Fallback to local uploads directory if Cloudinary is not configured or fails
    const filename = `challenge_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.jpg`;
    const targetPath = path.join(uploadsDir, filename);

    if (fileBuffer) {
      fs.writeFileSync(targetPath, fileBuffer);
    } else if (base64Data) {
      const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, '');
      fs.writeFileSync(targetPath, Buffer.from(base64Image, 'base64'));
    }

    const localUrl = `/uploads/${filename}`;
    return res.status(200).json({
      success: true,
      url: localUrl,
      provider: 'local_storage',
      message: 'Cloudinary credentials pending in .env. Image stored locally.',
    });
  } catch (err) {
    console.error('[Upload Controller Error]', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Image upload processing failed',
    });
  }
};

/**
 * GET /api/upload/config
 * Returns Cloudinary integration status
 */
const getUploadConfig = (req, res) => {
  const configured = isCloudinaryConfigured();
  return res.json({
    success: true,
    cloudinary: {
      isConfigured: configured,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME || null,
      folder: 'samadhansetu/challenges',
    },
  });
};

module.exports = {
  uploadImage,
  getUploadConfig,
  uploadStreamToCloudinary,
};
