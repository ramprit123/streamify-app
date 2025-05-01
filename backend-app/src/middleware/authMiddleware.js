import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    // Get token from cookie
    const token = req.cookies.accessToken;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from the token
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      console.log("user not logged in");
      res.error("User not logged in", 401);
    }

    next();
  } catch (error) {
    res.error("Not authorized, please login again", 401);
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized as an admin");
  }
};
