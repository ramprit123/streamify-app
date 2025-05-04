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
  getUsers,
  acceptFriendRequest,
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { paginateResults } from "../middleware/paginationMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

router.use(protect);
// Protected routes
router.route("/profile").get(getUserProfile).put(updateUserProfile);

router.get("/recommended-friends", recommendedFriends);
router.get("/my-friends", paginateResults(10), myFriends);
router.post("/friend-request/:id", sendFriendRequest);
router.post("/friend-request/:id", acceptFriendRequest);

// Admin routes
router.get("/", admin, paginateResults(10), getUsers);
router.delete("/:id", admin, deleteUser);

export default router;
