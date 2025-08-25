import express from 'express';
import { createProduct } from '../controller/productController.js';
import upload from '../middleware/uploads.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post("/create-product",upload.single("image"),auth, createProduct); 

export default router;