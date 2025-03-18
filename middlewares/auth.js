import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { asyncRequestHandler } from "../utils/asyncHandler.js";
import ErrorHandler from "./error.js";

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
    req.user = await User.findById(decoded._id).select("+password");

    if (!req.user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    next(); // Proceed to next middleware/controller

});


// Middleware to make sure only admin is allowed...
// Approach 01...
export const adminOnly = (req, res, next) => {
  console.log(req.user);
  
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Only Admin is allowed.",
    });
  }
  next();
};

// Approach 02...
// export const adminOnly = asyncRequestHandler(async(req, res, next)=>{
//   const {id} = req.query;

//   if(!id)
//     return next(new ErrorHandler("Login first", 400));

//   const user = await User.findById(id);
//   if(!req.user)
//     return next(new ErrorHandler("User does not exist", 400));

//   if(req.user.role != "admin")
//     return next(new ErrorHandler("Only Admin is allowed", 403));

//   next();   //proceed if user is admin..
// })