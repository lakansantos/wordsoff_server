import dotenv from 'dotenv';

dotenv.config();

export const JWT_SECRET_KEY = process.env.JWT_SECRET;
export const API_VERSION = process.env.API_VERSION;
export const API_VERSION_URL = `/api/${API_VERSION}`;
export const API_CLOUDINARY_KEY = process.env.API_CLOUDINARY_KEY;
export const API_CLOUDINARY_SECRET =
  process.env.API_CLOUDINARY_SECRET;
export const API_CLOUD_NAME = process.env.API_CLOUD_NAME;
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;
