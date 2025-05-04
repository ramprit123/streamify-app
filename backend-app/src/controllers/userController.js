import jwt from "jsonwebtoken";
import FriendRequest from "../models/friendRequest.js";
import Onboarding from "../models/Onboard.js";
import User from "../models/User.js";
import { logSystemActivity } from "../utils/logger.js";

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      // Log the registration
      await logSystemActivity({
        user,
        action: "REGISTER",
        entityType: "User",
        entityId: user._id,
        currentState: { name: user.name, email: user.email },
        req,
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Log the login
    await logSystemActivity({
      user,
      action: "LOGIN",
      entityType: "User",
      entityId: user._id,
      currentState: { lastLogin: new Date() },
      req,
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const previousState = {
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    };

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.avatar = req.body.avatar || user.avatar;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    // Log the update
    await logSystemActivity({
      user: updatedUser,
      action: "UPDATE",
      entityType: "User",
      entityId: updatedUser._id,
      previousState,
      currentState: {
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
      },
      req,
    });

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const previousState = {
      name: user.name,
      email: user.email,
      role: user.role,
    };

    await user.remove();

    // Log the deletion
    await logSystemActivity({
      user: req.user, // Admin who performed the deletion
      action: "DELETE",
      entityType: "User",
      entityId: user._id,
      previousState,
      req,
    });

    res.json({ message: "User removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export const recommendedFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.error("User not found", 404);
    }

    // Get onboarded users
    const onboardedUserIds = await Onboarding.find({
      isOnboarded: true,
    }).distinct("user");
    const recommendedUsers = await User.find({
      $and: [
        { _id: { $ne: req.user._id } },
        { _id: { $nin: user.friends } },
        { _id: { $in: onboardedUserIds } },
      ],
    });

    res.success(recommendedUsers, 200);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const myFriends = async (req, res) => {
  try {
    // Find user and populate friends in one query
    const user = await User.findById(req.user._id).populate({
      path: "friends",
      select: "name email avatar role", // Only select needed fields
    });

    if (!user) {
      return res.error("User not found", 404);
    }

    // Log the friends fetch activity
    await logSystemActivity({
      user,
      action: "FETCH_FRIENDS",
      entityType: "User",
      entityId: user._id,
      currentState: { friendsCount: user.friends.length },
      req,
    });

    // Add pagination support
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedFriends = user.friends.slice(startIndex, endIndex);

    res.success(
      {
        friends: paginatedFriends,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(user.friends.length / limit),
          totalFriends: user.friends.length,
        },
      },
      200
    );
  } catch (error) {
    console.error("Error in myFriends:", error);
    res.status(500).json({
      message: "Failed to fetch friends",
      error: error.message,
    });
  }
};
export const sendFriendRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: recipientId } = req.params;

    // Validate request parameters
    if (!userId || !recipientId) {
      return res.error("Invalid request - missing required parameters", 400);
    }

    // Validate user is not sending request to themselves
    if (userId.toString() === recipientId) {
      return res.error("You cannot send a friend request to yourself", 400);
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.error("Recipient user not found", 404);
    }

    // Check if request already exists
    const existingRequest = await FriendRequest.findOne({
      sender: userId,
      recipient: recipientId,
      status: { $in: ["pending", "accepted"] },
    });

    if (existingRequest) {
      return res.error(
        "A friend request already exists or you are already friends",
        400
      );
    }

    // Check if users are already friends
    const sender = await User.findById(userId);
    if (sender.friends.includes(recipientId)) {
      return res.error("You are already friends with this user", 400);
    }

    // Create new friend request
    const request = await FriendRequest.create({
      sender: userId,
      recipient: recipientId,
      status: "pending",
    });

    // Log the friend request
    await logSystemActivity({
      user: sender,
      action: "FRIEND_REQUEST_SENT",
      entityType: "FriendRequest",
      entityId: request._id,
      currentState: {
        sender: userId,
        recipient: recipientId,
        status: "pending",
      },
      req,
    });

    res.success(
      {
        message: "Friend request sent successfully",
        request,
      },
      201
    );
  } catch (error) {
    console.error("Error in sendFriendRequest:", error);
    res.error("An error occurred while processing your request", 500);
  }
};
