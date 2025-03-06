import User from "../models/user.js";
import bcrypt from "bcrypt";
import { sendCookie } from "../utils/features";


export const register = async(req, res, next) => {    
    try {
      const { name, email, password} = req.body;
    
      let user = await User.findOne({ email: email});
      if(user){
          return next(new ErrorHandler("User already Exists", 400))
      }
      const hashedPassword = await bcrypt.hash(password, 10);
  
      user = await User.create({
          name,
          email,
          password: hashedPassword,
      })
  
      sendCookie(user, res, 201, "Registered Successfully")
      
    } catch (error) {
      next(error);
    }
  };

//   For login:

export const login = async(req, res, next) => {    
    try {
    const {email, password} = req.body;

    let user = await User.findOne({ email: email}).select("+password");
    if(!user){
         return next(new ErrorHandler("Invalid Email and Password", 404))
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch){
      return next(new ErrorHandler("Invalid Email and Password", 404))
    }

    sendCookie(user, res, 200, `Welcome back, ${user.name}`)
    } 
        catch (error) {
        next(error)
    }
};