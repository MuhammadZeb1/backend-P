import express from 'express'
import { login, profile, register } from '../controller/roleBasedAuthController.js'
import auth from '../middleware/auth.js'
import upload from '../middleware/uploads.js'
const route =express.Router()

//register route
route.post("/register",upload.single("image"), register)
route.post("/login", login)
route.post("/profile",auth, profile)



export default route;