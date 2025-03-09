import User from "../models/user.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendCookie } from "../utils/features.js";
import { asyncRequestHandler } from "../utils/asyncHandler.js";
import userSchema from "../validationSchemas/userValidationSchema.js";
import ErrorHandler from "../utils/error.js";
import { sendEmail } from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";
import loginSchema from "../validationSchemas/uservalidationloginSchema.js";
import { sendforgetEmail } from "../utils/sendforgetEmail.js";

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
    console.log("Resend Email Error:", resendError);
    
    return next(new ErrorHandler(resendError, 500));
  }

  res.status(200).json({
    success: true,
    message: "Registered successfully! Please verify your email to login.",
  });

});

//   For login:
export const login = asyncRequestHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const { error } = loginSchema.validate(req.body);

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

// verifyEmail...
export const verifyEmail = asyncRequestHandler(async (req, res, next) => {
  const { token } = req.query;
  console.log(token);
  
  if (!token) return next(new ErrorHandler("Token is required.", 401));

  const decodedData = jwt.verify(token, process.env.JWT_EMAIL_SECRET);

  const user = await User.findOne({ email: decodedData.email });
  if (!user) {
    return next(new ErrorHandler("User not found.", 404));
  }
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



// ProfileUpdate...

export const profileUpdate = asyncRequestHandler(async (req, res, next) => {
  const {name, email, password, newPassword} = req.body;
  const userId = req.user._id;
  const user = await User.findById(userId);

  if (!user) {
    return next(new ErrorHandler("User not found.", 404));
  }

  if(name){
    user.name = name;
  }

  if(email){
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== userId.toString()) {
      return next(new ErrorHandler("Email already in use.", 400));
    }
    user.email = email;
    user.isVerified = false;
  }

  if (password && newPassword) {
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new ErrorHandler("Incorrect old password.", 400));
    }

    user.password = await bcrypt.hash(newPassword, 10);
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully.",
    user,
  })
})

// For logout..

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

// Forget Password:

export const forgetPassword = asyncRequestHandler(async(req, res, next) => {

  const {email} = req.body
  const user = await User.findOne({email})

  if(!user)
    return next(new ErrorHandler("User not found", 400))

  const resetTokens = await user.getResetToken()
  // save token in db..
  await user.save();
    // send token to email..
  const { data, error: resendError } = await sendforgetEmail(resetTokens);

  if (resendError) {
    console.log("Resend Email Error:", resendError);
    
    return next(new ErrorHandler(resendError, 500));
  }

  res.status(200).json({
    success: true,
    message: `Reset token has been sent to ${user.email}`
  })
})

// Reset Password...
export const resetPassword = asyncRequestHandler(async(req, res, next) => {
  const {token} = req.params;

  const resetPasswordToken =
    crypto.createHash("sha256").update(token).digest("hex");
    console.log(resetPasswordToken);
    
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: {
        $gt: Date.now(),
      }
    });

  if(!user)
    return next(new ErrorHandler("Token is invalid or has been Expired", 400));

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password Changed Successfully",
  })
})