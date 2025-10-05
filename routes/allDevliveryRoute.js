import express from 'express'
import { allDelivery } from '../controller/allDeliveryController.js'

const router = express.Router()

router.get("allDelivery",allDelivery)

export default router