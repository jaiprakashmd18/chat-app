const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = 'mechat/misc';
    let resource_type = 'auto';

    if (file.mimetype.startsWith('image/')) folder = 'mechat/images';
    else if (file.mimetype.startsWith('video/')) folder = 'mechat/videos';
    else if (file.mimetype.startsWith('audio/')) folder = 'mechat/audio';
    else folder = 'mechat/documents';

    return { folder, resource_type, allowed_formats: null };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

module.exports = { cloudinary, upload };
