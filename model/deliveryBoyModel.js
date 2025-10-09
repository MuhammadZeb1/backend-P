import mongoose from "mongoose";


const deliveryBoySchema = new mongoose.Schema({

     vendorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "roleBasedAuth", // product owner
          required: true,
        },
        deliveryId:{
          type: mongoose.Schema.Types.ObjectId,
          ref: "roleBasedAuth", 
          required: true,
        },
})

const deliveryBoyModel = mongoose.model("deliveryBoy", deliveryBoySchema);
export default deliveryBoyModel
   