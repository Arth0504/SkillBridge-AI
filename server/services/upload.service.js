import cloudinary from '../config/cloudinary.js';
import { logger } from '../utils/logger.js';

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} buffer File buffer
 * @param {string} folder Cloudinary folder path
 * @param {string} [resourceType='auto'] Resource type ('image' | 'raw' | 'auto')
 * @returns {Promise<{ url: string, publicId: string }>} Upload result object
 */
export const uploadToCloudinary = (buffer, folder = 'skillbridge', resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    // If mock keys in dev environment, simulate instant upload
    if (!process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY === '123456789') {
      const mockId = `mock_${folder}_${Date.now()}`;
      return resolve({
        url: `https://res.cloudinary.com/demo/image/upload/v1/${folder}/${mockId}`,
        publicId: mockId,
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) {
          logger.error(`Cloudinary Upload Error: ${error.message}`);
          return reject(error);
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Delete an asset from Cloudinary by public ID
 * @param {string} publicId Cloudinary asset public ID
 * @returns {Promise<boolean>}
 */
export const deleteFromCloudinary = async (publicId) => {
  if (!publicId || publicId.startsWith('mock_')) return true;
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    logger.error(`Cloudinary Delete Error: ${error.message}`);
    return false;
  }
};
