import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/index';
import { logger } from '../logger/index';

cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

export const uploadToCloudinary = (
  fileBuffer: Buffer,
  folder: string,
  resourceType: 'image' | 'raw' = 'image'
): Promise<CloudinaryUploadResult> => {
  // Check if Cloudinary configuration is using default placeholders
  if (
    config.CLOUDINARY_API_KEY.includes('your_') ||
    config.CLOUDINARY_CLOUD_NAME.includes('your_') ||
    config.CLOUDINARY_API_SECRET.includes('your_')
  ) {
    let mimeType = 'image/png';
    if (fileBuffer.length > 4) {
      const hex = fileBuffer.slice(0, 4).toString('hex').toUpperCase();
      if (hex.startsWith('89504E47')) {
        mimeType = 'image/png';
      } else if (hex.startsWith('FFD8FF')) {
        mimeType = 'image/jpeg';
      } else if (hex.startsWith('47494638')) {
        mimeType = 'image/gif';
      } else if (fileBuffer.slice(0, 100).toString('ascii').toLowerCase().includes('<svg')) {
        mimeType = 'image/svg+xml';
      } else if (resourceType === 'raw') {
        mimeType = 'application/octet-stream';
      }
    }
    const dataUrl = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
    logger.warn(`[DEVELOPMENT] Cloudinary API key is not configured. Falling back to local Base64 Data URL for upload in: ${folder}`);
    return Promise.resolve({
      url: dataUrl,
      publicId: `mock-id-${folder.replace(/\//g, '-')}-${Date.now()}`,
    });
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `pcinfotech/${folder}`,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) {
          logger.error('Cloudinary upload error:', error);
          return reject(error);
        }
        if (!result) {
          return reject(new Error('Cloudinary result is empty'));
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );
    uploadStream.end(fileBuffer);
  });
};

export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: 'image' | 'raw' = 'image'
): Promise<void> => {
  if (
    publicId.startsWith('mock-id-') ||
    config.CLOUDINARY_API_KEY.includes('your_') ||
    config.CLOUDINARY_CLOUD_NAME.includes('your_')
  ) {
    logger.info(`[DEVELOPMENT] Skipping deleteFromCloudinary for mock ID: ${publicId}`);
    return;
  }
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    logger.error(`Error deleting file from Cloudinary (Public ID: ${publicId}):`, error);
  }
};
