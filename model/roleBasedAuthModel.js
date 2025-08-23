import mongoose from "mongoose";

const roleBasedAuthSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,  
    },
    email:{
        type:String,
        required:true,  
    },
    password:{
        type:String,
        required:true,  
    },
    role:{
        type:String,
        enum:["vendor","customer","delivery"],
        default:"customer"
    }
})
const roleBasedAuthModel = mongoose.model("roleBasedAuth", roleBasedAuthSchema)
export default roleBasedAuthModel;