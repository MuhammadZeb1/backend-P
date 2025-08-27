import express from 'express';
import { 
  createProduct, 
  deleteProduct, 
  readProducts, 
  readSingleProduct, 
  updateProduct 
} from '../controller/productController.js';
import upload from '../middleware/uploads.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Create product
// ✔️ صحیح
router.post("/createProduct", auth, upload.single("image"), createProduct);


// Get all products
router.get("/products", auth, readProducts);

// Get single product
router.get("/products/:id", auth, readSingleProduct);

// Update product
router.put("/products/:id", upload.single("image"), auth, updateProduct);

// Delete product
router.delete("/products/:id", auth, deleteProduct);

export default router;
