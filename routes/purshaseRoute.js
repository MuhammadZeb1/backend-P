import express from "express";
import { deletePurchase, getPurchases, purchaseProduct } from "../controller/purchaseController.js";

const router = express.Router();

router.post("/purchase", purchaseProduct)
router.post("/purchase", getPurchases)
router.delete("/purchase", deletePurchase)

export default router;