import express from "express";
import { deletePurchase, getPurchases, purchaseProduct } from "../controller/purchaseController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/purchase",auth, purchaseProduct)
router.post("/purchase",auth, getPurchases)
router.delete("/purchase",auth, deletePurchase)

export default router;