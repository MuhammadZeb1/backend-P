import express from 'express'

import auth from '../middleware/auth.js';
import { assignDelivery, getDeliveryBoyDeliveries, getVendorDeliveries }
 from '../controller/deliveryAssignmentController.js';


const router = express.Router()

// Define your delivery assignment routes here
router.post('/assign', auth, assignDelivery);
router.get('/vendor/deliveries', auth, getVendorDeliveries);
router.get('/deliveryBoy', auth, getDeliveryBoyDeliveries);
export default router