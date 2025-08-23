
import jwt from 'jsonwebtoken';

const  auth = (req,res)=>{
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({status:"failed",message:"Access denied, no token provided"});

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded; // Attach user info to request object
        return res.status(200).json({status:"success",message:"User authenticated successfully",user:decoded});
    } catch (error) {
        return res.status(401).json({status:"failed",message:"Invalid token",error:error.message});
    }
}
    

export default auth;