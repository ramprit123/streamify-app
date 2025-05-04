import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  recommendedFriends,
  myFriends,
  sendFriendRequest,
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

router.use(protect);
// Protected routes
router.route("/profile").get(getUserProfile).put(updateUserProfile);

router.get("/recommended-friends", recommendedFriends);
router.get("/my-friends", myFriends);
router.post("/friend-request/:id", sendFriendRequest);

// Admin routes
router.delete("/:id", admin, deleteUser);

export default router;
