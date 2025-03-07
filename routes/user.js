import express from "express";
import {
  register,
  login,
  getUserDetails,
  adminDashboard,
  verifyEmail,
  logout,
} from "../controllers/user.js";
import { isAuthenticated, isAuthorized } from "../middlewares/auth.js";

const router = express.Router();

router.post("/signup", register);
router.post("/login", login);
router.get("/verify-email", verifyEmail);
router.get("/userdetails", isAuthenticated, getUserDetails);
router.get("/logout", logout);
router.get("/admin", isAuthenticated, isAuthorized("admin"), adminDashboard);

export default router;
