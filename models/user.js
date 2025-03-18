import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import crypto from 'crypto'
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
    },
    email: {
      type: String,
      required: true,
      unique: [true, "Email is required."],
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      select: false,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    
    isVerified: {
      type: Boolean,
      default: false,
    },
    avatar: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
        default:
          "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
      },
    },
    resetPasswordToken: String,
    resetPasswordExpire: String,
  },
  { timestamps: true },
  
);

// VerificationEmail token using jwt...
userSchema.methods.getEmailVerificationToken = function(){
  const token = jwt.sign(
      { email: this.email },
     process.env.JWT_EMAIL_SECRET,
      { expiresIn: process.env.JWT_EMAIL_SECRET_EXPIRY_TIME,}
    ); 
    console.log(token);
    return token;
}

// ResetPassword token using crypto to send via email...

// pass this token to email..
userSchema.methods.getResetToken = function(){

  const resetToken = crypto.randomBytes(20).toString("hex");
  // Implement Algorithm to convert it into Hash...
  this.resetPasswordToken =
  crypto.createHash("sha256").update(resetToken).digest("hex");
  // set expire time...
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  console.log(resetToken);
  return resetToken;
}



const User = mongoose.model("User", userSchema);
export default User;
