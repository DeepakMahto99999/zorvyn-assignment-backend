import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const verifyToken = async (req, res, next) => {
  try {
    // 1. Check header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const error = new Error("No token provided");
      error.statusCode = 401;
      throw error;
    }

    const token = authHeader.split(" ")[1];

    // 2. Check secret
    if (!process.env.JWT_SECRET) {
      const error = new Error("JWT_SECRET not defined");
      error.statusCode = 500;
      throw error;
    }

    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Fetch user
    const user = await User.findById(decoded.id);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 401;
      throw error;
    }

    // 5. Check status
    if (user.status !== "active") {
      const error = new Error("Account is inactive");
      error.statusCode = 401;
      throw error;
    }

    // 6. Attach user
    req.user = {
      id: user._id,
      role: user.role,
    };

    next();
  } catch (error) {
    error.statusCode = error.statusCode || 401;
    next(error);
  }
};

export default verifyToken;