import express from "express";
import { deletePurchase, getCustomerPurchases, getVendorPurchases, purchaseProduct } from "../controller/purchaseController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/purchase",auth, purchaseProduct)
router.get("/purchase",auth, getCustomerPurchases)
router.get("/vendorPurchase",auth, getVendorPurchases)
router.delete("/purchase/:id",auth, deletePurchase)

export default router;