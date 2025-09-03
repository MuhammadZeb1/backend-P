import express from "express"
import { vendorDeshborad } from "../controller/vendorController.js"


const router = express.Router()

router.get("/vendors",vendorDeshborad)


export default router