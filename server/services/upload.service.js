import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import cloudinary from '../config/cloudinary.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Upload a file buffer to Cloudinary in Production, or save with UUID filename to local /uploads directory in Development
 * @param {Buffer} buffer File buffer
 * @param {string} folder Target folder path (e.g. 'skillbridge/resumes' or 'skillbridge/avatars')
 * @param {string} [resourceType='auto'] Resource type ('image' | 'raw' | 'auto')
 * @returns {Promise<{ url: string, publicId: string }>} Upload result object containing file URL and public ID
 */
export const uploadToCloudinary = (buffer, folder = 'skillbridge', resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    if (!buffer || !Buffer.isBuffer(buffer)) {
      return reject(new Error('Invalid file buffer provided for upload.'));
    }

    const isResume = folder.includes('resumes');
    const isLogo = folder.includes('logos');
    const isAvatar = folder.includes('avatars') || resourceType === 'image';
    const maxSize = isResume ? 5 * 1024 * 1024 : (isLogo ? 3 * 1024 * 1024 : 2 * 1024 * 1024);

    // File Size Validation
    if (buffer.length > maxSize) {
      const msg = isResume ? 'Maximum resume size is 5 MB.' : (isLogo ? 'Maximum logo image size is 3 MB.' : 'Maximum avatar image size is 2 MB.');
      return reject(new Error(msg));
    }

    // Generate Unique Filename using UUID
    const uuid = randomUUID();
    const prefix = isResume ? 'resume' : (isLogo ? 'logo' : 'avatar');
    const ext = isResume ? '.pdf' : '.png';
    const uuidFilename = `${prefix}_${uuid}${ext}`;
    const publicIdName = `${prefix}_${uuid}`;

    // 1. Production Mode: Upload to configured Cloudinary account
    const hasCloudinaryCredentials =
      Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
      Boolean(process.env.CLOUDINARY_API_KEY) &&
      process.env.CLOUDINARY_API_KEY !== '123456789' &&
      Boolean(process.env.CLOUDINARY_API_SECRET) &&
      process.env.CLOUDINARY_API_SECRET !== 'secret';

    if (hasCloudinaryCredentials) {
      const uploadOptions = {
        folder,
        public_id: publicIdName,
        resource_type: resourceType === 'raw' ? 'auto' : resourceType,
        use_filename: false,
        unique_filename: false,
      };

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            logger.error(`Cloudinary Upload Error: ${error.message}`);
            return reject(new Error(`Cloudinary upload failed: ${error.message}`));
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      );

      uploadStream.end(buffer);
      return;
    }

    // 2. Development Mode: Store file in local /uploads directory using UUID filename
    try {
      const subDir = isResume ? 'resumes' : (isLogo ? 'logos' : 'avatars');
      const uploadsDir = path.join(__dirname, '..', 'uploads', subDir);
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, uuidFilename);
      fs.writeFileSync(filePath, buffer);

      const serverPort = process.env.PORT || 5000;
      const localFileUrl = `http://localhost:${serverPort}/uploads/${subDir}/${uuidFilename}`;
      const publicId = `local_${subDir}_${uuidFilename}`;

      logger.info(`Local development file saved: ${filePath} -> ${localFileUrl}`);
      resolve({
        url: localFileUrl,
        publicId,
      });
    } catch (err) {
      logger.error(`Local File Storage Error: ${err.message}`);
      reject(new Error(`Failed to store uploaded file locally: ${err.message}`));
    }
  });
};

/**
 * Delete an asset from Cloudinary or local /uploads directory by public ID
 * @param {string} publicId Cloudinary or local asset public ID
 * @returns {Promise<boolean>}
 */
export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return true;

  if (publicId.startsWith('local_')) {
    try {
      const parts = publicId.split('_');
      const subDir = parts[1];
      const filename = parts.slice(2).join('_');
      const filePath = path.join(__dirname, '..', 'uploads', subDir, filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.info(`Successfully deleted old local file: ${filePath}`);
      }
      return true;
    } catch (err) {
      logger.error(`Local File Delete Error: ${err.message}`);
      return false;
    }
  }

  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    logger.error(`Cloudinary Delete Error: ${error.message}`);
    return false;
  }
};
