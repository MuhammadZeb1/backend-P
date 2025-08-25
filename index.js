import express from "express"
import cors from "cors"
import mongodbConnect from "./config/mongodb.js"

import productRoute from "./routes/productRoutes.js"
import roleBasedAuthRoute from "./routes/roleBasedAuthRoute.js"

const app = express()
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))
app.use(express.json())
mongodbConnect()

app.use("/auth", roleBasedAuthRoute)
app.use("/product",productRoute )
app.listen(1212,()=>{
    console.log("http://localhost:1212")
})