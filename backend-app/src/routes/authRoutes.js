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
    registerValidation,
    updateProfileValidation,
} from '../middleware/validationMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerValidation, registerUser);
router.post('/login', loginValidation, loginUser);

// Token management routes
router.post('/refresh-token', refreshToken);
router.post('/logout', protect, logoutUser);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateProfileValidation, updateUserProfile);

export default router;