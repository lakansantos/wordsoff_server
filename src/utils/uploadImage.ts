import {
  API_CLOUD_NAME,
  API_CLOUDINARY_KEY,
  API_CLOUDINARY_SECRET,
} from '@configs/environment';
import { v2 as cloudinary, UploadApiOptions } from 'cloudinary';

const uploadImage = async (
  imagePath: string,
  options: UploadApiOptions,
) => {
  try {
    // Configuration
    cloudinary.config({
      cloud_name: API_CLOUD_NAME,
      api_key: API_CLOUDINARY_KEY,
      api_secret: API_CLOUDINARY_SECRET, // Click 'View Credentials' below to copy your API secret
    });

    // Upload an image
    const uploadResult = await cloudinary.uploader.upload(
      imagePath,
      options,
    );

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
    throw new Error(e as string);
  }
};
const deleteImage = async (public_id: string) => {
  try {
    // Configuration
    cloudinary.config({
      cloud_name: API_CLOUD_NAME,
      api_key: API_CLOUDINARY_KEY,
      api_secret: API_CLOUDINARY_SECRET, // Click 'View Credentials' below to copy your API secret
    });

    await cloudinary.uploader.destroy(public_id);
  } catch (e) {
    throw new Error(e as string);
  }
};

export { uploadImage, deleteImage };
