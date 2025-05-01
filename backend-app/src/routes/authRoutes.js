import express from 'express';
import {
    getUserProfile,
    loginUser,
    logoutUser,
    refreshToken,
    registerUser,
    updateUserProfile,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  loginValidation,
  mobileValidation,
  registerValidation,
  updateProfileValidation,
  verifyOtpValidation,
} from "../middleware/validationMiddleware.js";
import { sendOTP, verifyOTP } from "../controllers/mobileAuthController.js";

const router = express.Router();

// Public routes
router.post("/register", registerValidation, registerUser);
router.post("/login", loginValidation, loginUser);
router.post("/mobile/send-otp", mobileValidation, sendOTP);
router.post("/mobile/verify-otp", verifyOtpValidation, verifyOTP);

// Token management routes
router.post('/refresh-token', refreshToken);
router.post('/logout', protect, logoutUser);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateProfileValidation, updateUserProfile);

export default router;