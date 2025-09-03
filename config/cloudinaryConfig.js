// config/cloudinaryConfig.js
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret:"-vMrjP8fWWAI_nnyw0yVbXBymu4",
  // api_secret:process.env.CLOUD_API_KEY,
});

export default cloudinary;
