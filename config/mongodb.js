import { configDotenv } from "dotenv";
import mongoose from "mongoose";
configDotenv();
const mongodbConnect = ()=>{
     mongoose.connect(process.env.DATA_BASE_URL)
    .then(()=> console.log("mongodb is connect successfully .."))
    .catch((err)=> console.log("mongodb is not connect successfully ..",err))
}

export default mongodbConnect;