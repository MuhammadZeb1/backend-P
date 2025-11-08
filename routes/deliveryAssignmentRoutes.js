import express from 'express'

import auth from '../middleware/auth.js';
import { assignDelivery, deleteDelivery, getDeliveryBoyDeliveries, getVendorDeliveries }
 from '../controller/deliveryAssignmentController.js';


const router = express.Router()

// Define your delivery assignment routes here
router.post('/assign', auth, assignDelivery);
router.get('/vendor/deliveries', auth, getVendorDeliveries);
router.get('/deliveryBoy', auth, getDeliveryBoyDeliveries);
router.delete("/delivery/:purchaseId", auth, deleteDelivery);
export default router