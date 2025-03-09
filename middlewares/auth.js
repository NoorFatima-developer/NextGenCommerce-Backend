import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { asyncRequestHandler } from "../utils/asyncHandler.js";

export const isAuthenticated = asyncRequestHandler (async (req, res, next) => {
  const { token } = req.cookies; // Extract token from cookies
  console.log("Token:", token);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Login First!",
    });
  }
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded);

    // Fetch user from DB and exclude password
    req.user = await User.findById(decoded._id).select("-password");

    if (!req.user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    next(); // Proceed to next middleware/controller

});

export const isAuthorized = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized! Please login first.",
      });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({
        success: false,
        message: `Access Denied! Only ${requiredRole}s are allowed.`,
      });
    }

    next(); // Allow access
  };
};
