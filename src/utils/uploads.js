import { v2 as cloudinary } from 'cloudinary';
import {
  API_CLOUD_NAME,
  API_CLOUDINARY_KEY,
  API_CLOUDINARY_SECRET,
} from '../config/environment.js';

const uploadImage = async (imagePath, transformation) => {
  try {
    // Configuration
    cloudinary.config({
      cloud_name: API_CLOUD_NAME,
      api_key: API_CLOUDINARY_KEY,
      api_secret: API_CLOUDINARY_SECRET, // Click 'View Credentials' below to copy your API secret
    });

    // Upload an image
    const uploadResult = await cloudinary.uploader.upload(imagePath, {
      transformation: transformation,
    });

    const { public_id } = uploadResult || {};

    // Optimize delivery by resizing and applying auto-format and auto-quality
    const url = cloudinary.url(public_id, {
      fetch_format: 'auto',
      quality: 'auto',
    });

    return {
      ...uploadResult,
      url,
    };
  } catch (e) {
    throw new Error(e.error.code);
  }
};
const deleteImage = async (public_id) => {
  try {
    // Configuration
    cloudinary.config({
      cloud_name: API_CLOUD_NAME,
      api_key: API_CLOUDINARY_KEY,
      api_secret: API_CLOUDINARY_SECRET, // Click 'View Credentials' below to copy your API secret
    });

    await cloudinary.uploader.destroy(public_id);
  } catch (e) {
    throw new Error(e);
  }
};

export { uploadImage, deleteImage };
