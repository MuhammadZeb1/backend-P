import express from "express"
import { singleVendorProducts, vendorDeshborad } from "../controller/vendorController.js"


const router = express.Router()

router.get("/vendors",vendorDeshborad)
router.get("/vendors/:id",singleVendorProducts)


export default router