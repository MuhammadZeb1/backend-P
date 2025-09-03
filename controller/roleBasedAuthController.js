import express from 'express'
import User from "../model/roleBasedAuthModel.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
//register
 // ✅ Register Controller
export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      address,
      cnicNumber,
      shopName,
      shopType,
    } = req.body;

    // ✅ Required validation
    if (!name || !email || !password || !role || !address || !cnicNumber) {
      return res
        .status(400)
        .json({ status: "failed", message: "All fields are required" });
    }

    // ✅ Extra checks if role is vendor
    if (role === "vendor") {
      if (!shopName || !shopType) {
        return res.status(400).json({
          status: "failed",
          message: "Shop name and shop type are required for vendors",
        });
      }
    }

    // ✅ Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ status: "failed", message: "User already exists" });
    }

    // ✅ Check existing CNIC
    const existingCNIC = await User.findOne({ cnicNumber });
    if (existingCNIC) {
      return res
        .status(400)
        .json({ status: "failed", message: "CNIC already registered" });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      address,
      cnicNumber,
      shopName: role === "vendor" ? shopName : undefined,
      shopType: role === "vendor" ? shopType : undefined,
    });

    await newUser.save();

    return res
      .status(201)
      .json({ status: "success", message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "Internal server error",
      error: error.message,
    });
  }
};

//login
 

export const login = async (req,res)=>{
    try {
       const {email,password} = req.body;
       
       if(!email|| !password) return res.status(400).json({status:"failed",message:"All fields are required"});
           const user = await User.findOne({ email });
            if (!user) return res.status(400).json({ status: false, message: "User not found" });
           const comparePassword = await bcrypt.compare(password, user.password);
           if (!user || !comparePassword) return res.status(400).json({status:false,message:"Invalid credentials"});

           const token = jwt.sign({id:user._id,email:user.email,role:user.role},process.env.SECRET_KEY, {expiresIn:"1d"});
           console.log(req.headers)

return res.status(200).json({
  status: "success",
  message: "User login successfully",
  token,
  role: user.role 
});

    } catch (error) {
        res.status(500).json({status:"failed",message:"Internal server error",error:error.message});
    }
}
// profile
export const profile = async (req,res)=>{
    try {
        const user = await User.findById(req.user.id)
        console.log(user)
    } catch (error) {
        
    }
    
}
    