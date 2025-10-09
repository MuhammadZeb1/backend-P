import express from "express";
import {
  allDelivery,
  addDelivery,
  getApprovedDeliveries,
} from "../controller/allDeliveryController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// ✅ Get all delivery users (role = delivery)
router.get("/getDelivery",auth, allDelivery);

// ✅ Approve a delivery boy (vendor approves one delivery user)
router.post("/postDelivery",auth, addDelivery);

// ✅ Get approved delivery boys for a vendor
router.get("/approved",auth, getApprovedDeliveries);

export default router;
