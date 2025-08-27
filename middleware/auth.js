import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        status: "failed",
        message: "Access denied, no token provided"
      });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded; // attach user info to request object

    // ✅ آگے controller کو بھیج دو
    next();  

  } catch (error) {
    return res.status(401).json({
      status: "failed",
      message: "Invalid token",
      error: error.message
    });
  }
};

export default auth;
