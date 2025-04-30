import express from 'express';
import {
  getSystemLogs,
  getSystemLogById,
  getUserActivityLogs,
  getActivitySummary,
} from '../controllers/systemLogController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected and require admin access
router.use(protect,admin);

router.get('/', getSystemLogs);
router.get('/summary', getActivitySummary);
router.get('/:id', getSystemLogById);
router.get('/user/:userId', getUserActivityLogs);

export default router;