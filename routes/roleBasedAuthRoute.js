import express from 'express'
import { login, profile, register } from '../controller/roleBasedAuthController.js'
import auth from '../middleware/auth.js'
const route =express.Router()

//register route
route.post("/register", register)
route.post("/login", login)
route.post("/profile",auth, profile)

//login

//logout

export default route;