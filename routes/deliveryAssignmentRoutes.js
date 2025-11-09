import express from 'express';
import auth from '../middleware/auth.js';
import { 
  assignDelivery, 
  deleteDelivery, 
  getDeliveryBoyDeliveries, 
  getVendorDeliveries, 
  updateDeliveryStatus // ✅ import update function
} from '../controller/deliveryAssignmentController.js';

const router = express.Router();

// Vendor assigns delivery
router.post('/assign', auth, assignDelivery);

// Get all deliveries assigned by vendor
router.get('/vendor/deliveries', auth, getVendorDeliveries);

// Get deliveries assigned to delivery boy
router.get('/deliveryBoy', auth, getDeliveryBoyDeliveries);

// Delete a delivery
router.delete("/delivery/:purchaseId", auth, deleteDelivery);

// ✅ Update delivery status
router.patch("/delivery/status", auth, updateDeliveryStatus);

export default router;
