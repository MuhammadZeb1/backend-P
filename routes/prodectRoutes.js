import express from 'express';
import { createProduct } from '../controller/productController.js';
import upload from '../middleware/uploads.js';

const router = express.Router();

router.post("/create-product",upload.single("image"), createProduct); 

export default router;