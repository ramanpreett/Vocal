import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = 'vocal_uploads';
    let resource_type = 'auto'; // automatically detects image/video/raw

    // For PDFs we might want to specify raw or let auto handle it
    if (file.mimetype === 'application/pdf') {
      resource_type = 'raw';
    }

    return {
      folder,
      resource_type,
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`
    };
  }
});

export { cloudinary, storage };
