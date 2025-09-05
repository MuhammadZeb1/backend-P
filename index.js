import express from "express"
import cors from "cors"
import mongodbConnect from "./config/mongodb.js"

import productRoute from "./routes/productRoutes.js"
import roleBasedAuthRoute from "./routes/roleBasedAuthRoute.js"
import vendorRoute from "./routes/vendorRoutes.js"
import cartRouter from './routes/cartRoute.js'

const app = express()
app.use(cors({
    origin:"http://localhost:5174",
    credentials:true
}))
// app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(express.json())
mongodbConnect()

app.use("/auth", roleBasedAuthRoute)
app.use("/product",productRoute )
app.use("/vendor",vendorRoute)
app.use("/vendor",vendorRoute)
app.use("/carts",cartRouter)
app.listen(1212,()=>{
    console.log("http://localhost:1212")
})