import express from "express";
import {
  register,
  login,
  getUserDetails,
  adminDashboard,
  verifyEmail,
  logout,
  profileUpdate,
  resetPassword,
  forgetPassword,
} from "../controllers/user.js";
import { isAuthenticated, isAuthorized } from "../middlewares/auth.js";

const router = express.Router();

router.post("/signup", register);
router.post("/login", login);
router.get("/verify-email", verifyEmail);
router.get("/userdetails", isAuthenticated, getUserDetails);
router.get("/logout", logout);
router.get("/admin", isAuthenticated, isAuthorized("admin"), adminDashboard);
router.patch("/update", isAuthenticated, profileUpdate);
router.post("/forgetpassword", forgetPassword)
router.put("/resetpassword/:token", resetPassword)

export default router;
