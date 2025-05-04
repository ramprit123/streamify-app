import express from 'express';
import {
  createOnboarding,
  getOnboarding,
  updateOnboarding,
  deleteOnboarding,
} from '../controllers/onboardingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router
  .route('/')
  .post(protect, createOnboarding)
  .get(protect, getOnboarding)
  .put(protect, updateOnboarding)
  .delete(protect, deleteOnboarding);

export default router;