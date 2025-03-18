import express from "express";
import {
  register,
  login,
  getUserDetails,
  verifyEmail,
  logout,
  profileUpdate,
  resetPassword,
  forgetPassword,
} from "../controllers/user.js";
import { isAuthenticated} from "../middlewares/auth.js";

const router = express.Router();

router.post("/signup", register);
router.post("/login", login);
router.get("/verify-email", verifyEmail);
router.get("/userdetails", isAuthenticated, getUserDetails);
router.get("/logout", logout);
router.patch("/update", isAuthenticated, profileUpdate);
router.post("/forgetpassword", forgetPassword);
router.put("/resetpassword/:token", resetPassword);

export default router;
