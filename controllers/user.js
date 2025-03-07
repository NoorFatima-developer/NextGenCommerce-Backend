import User from "../models/user.js";
import bcrypt from "bcrypt";
import { sendCookie } from "../utils/features.js";
import { asyncRequestHandler } from "../utils/asyncHandler.js";
import userSchema from "../validationSchemas/userValidationSchema.js";
import ErrorHandler from "../utils/error.js";
import { sendEmail } from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";

export const register = asyncRequestHandler(async (req, res, next) => {
  const { name, email, password } = req.body;
  const { error } = userSchema.validate(req.body);

  if (error) {
    return next(new ErrorHandler(error.details[0].message, 400));
  }

  let user = await User.findOne({ email: email });
  if (user) {
    return next(new ErrorHandler("User already Exists", 400));
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  const { data, error: resendError } = await sendEmail(email);

  if (resendError) {
    return next(new ErrorHandler(resendError, 500));
  }

  res.status(200).json({
    success: true,
    message: "Registered successfully! Please verify your email to login.",
  });

  // sendCookie(user, res, 201, "Registered Successfully");
});

//   For login:
export const login = asyncRequestHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const { error } = userSchema.validate(req.body);

  // check user validation...
  if (error) {
    return next(new ErrorHandler(error.details[0].message, 400));
  }

  let user = await User.findOne({ email: email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid Email and Password", 404));
  }

  // check user verification:
  if (!user.isVerified) {
    return next(
      new ErrorHandler("Please verify your email before logging in.", 403)
    );
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return next(new ErrorHandler("Invalid Email and Password", 404));
  }

  sendCookie(user, res, 200, `Welcome back, ${user.name}`);
});

export const verifyEmail = asyncRequestHandler(async (req, res, next) => {
  const { token } = req.query;

  if (!token) return next(new ErrorHandler("Token is required.", 401));

  const decodedData = jwt.verify(token, process.env.JWT_EMAIL_SECRET);

  const user = await User.findOne({ email: decodedData.email });

  user.isVerified = true;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Email verified",
  });
});

// For user...
export const getUserDetails = (req, res) => {
  res.json({
    success: true,
    user: req.user, // Since req.user is set in isAuthenticated
  });
};

// For admin...
export const adminDashboard = (req, res) => {
  res.json({
    success: true,
    message: "Welcome Admin!",
  });
};

export const logout = asyncRequestHandler(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      httpOnly: true,
    })
    .json({
      success: true,
      message: "Logged out.",
    });
});
