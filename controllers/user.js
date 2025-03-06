import User from "../models/user.js";
import bcrypt from "bcrypt";
import { sendCookie } from "../utils/features.js";
import { asyncRequestHandler } from "../utils/asyncHandler.js";
import userSchema from "../validationSchemas/userValidationSchema.js";
import ErrorHandler from "../middlewares/error.js";

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

  sendCookie(user, res, 201, "Registered Successfully");
});

//   For login:
export const login = asyncRequestHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const { error } = userSchema.validate(req.body);

  if (error) {
    return next(new ErrorHandler(error.details[0].message, 400));
  }

  let user = await User.findOne({ email: email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Email and Password", 404));
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return next(new ErrorHandler("Invalid Email and Password", 404));
  }

  sendCookie(user, res, 200, `Welcome back, ${user.name}`);
});
