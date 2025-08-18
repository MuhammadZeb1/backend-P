import express from "express"
import cors from "cors"
import mongodbConnect from "./config/mongodb.js"

const app = express()
app.use(cors({
    origin:true,
    credentials:true
}))
app.use(express.json())
mongodbConnect()

app.get("/",(req,res)=>{
    res.send("hello")
})
app.listen(1212,()=>{
    console.log("http://localhost:1212")
})