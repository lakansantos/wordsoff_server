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
    const uploadResult = await cloudinary.uploader
      .upload(imagePath, {
        transformation: transformation,
      })
      .catch((error) => {
        console.log(error);
      });

    const { public_id } = uploadResult || {};

    // Optimize delivery by resizing and applying auto-format and auto-quality
    cloudinary.url(public_id, {
      fetch_format: 'auto',
      quality: 'auto',
    });

    return uploadResult;

    // Transform the image: auto-crop to square aspect_ratio
  } catch (error) {
    console.error(error);
  }
};

export { uploadImage };
