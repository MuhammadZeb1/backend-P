import express from "express";
import { deleteCustomerPurchase, deletePurchase, getCustomerPurchases, getVendorPurchases, purchaseProduct } from "../controller/purchaseController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/purchase",auth, purchaseProduct)
router.get("/purchase",auth, getCustomerPurchases)
router.get("/vendorPurchase",auth, getVendorPurchases)
router.delete("/purchase/:id",auth, deletePurchase)
router.delete("/customer/:id", auth, deleteCustomerPurchase);


export default router;