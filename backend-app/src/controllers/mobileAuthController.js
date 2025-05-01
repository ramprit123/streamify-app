import twilio from "twilio";
import User from "../models/User.js";
import { logSystemActivity } from "../utils/logger.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);


// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Cookie options (same as authController)
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Generate tokens (same as authController)
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

// @desc    Send OTP for phone verification
// @route   POST /api/auth/mobile/send-otp
// @access  Public
export const sendOTP = async (req, res) => {
  try {
    const { phoneNumber, name } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    // Check if phone number already verified for another user
    const existingUser = await User.findOne({
      phoneNumber,
      phoneVerified: true,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Phone number already registered",
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Send OTP via Twilio
    await client.messages.create({
      body: `Your verification code is: ${otp}`,
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
    });

    // Save OTP to user if exists, or create new user
    let user = await User.findOne({ phoneNumber });
    if (!user) {
      user = await User.create({
        name,
        phoneNumber,
        phoneVerificationToken: otp,
        phoneVerificationExpire: otpExpiry,
      });
    } else {
      user.phoneVerificationToken = otp;
      user.phoneVerificationExpire = otpExpiry;
      if (!user.name) {
        user.name = name;
      }
      await user.save();
    }

    res.status(200).json({
      message: "OTP sent successfully",
      expiresIn: "10 minutes",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error sending OTP",
      error: error.message,
    });
  }
};

// @desc    Verify OTP and complete authentication
// @route   POST /api/auth/mobile/verify-otp
// @access  Public
export const verifyOTP = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({
        message: "Phone number and OTP are required",
      });
    }

    // Find user with phone and valid OTP
    const user = await User.findOne({
      phoneNumber,
      phoneVerificationToken: otp,
      phoneVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    // Mark phone as verified
    user.phoneVerified = true;
    user.phoneVerificationToken = undefined;
    user.phoneVerificationExpire = undefined;

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Set cookies
    res.cookie("accessToken", accessToken, cookieOptions);
    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Log the verification
    await logSystemActivity({
      user,
      action: "VERIFY_PHONE",
      entityType: "User",
      entityId: user._id,
      currentState: {
        phoneNumber: user.phoneNumber,
        phoneVerified: user.phoneVerified,
      },
      req,
    });

    res.status(200).json({
      _id: user._id,
      phoneNumber: user.phoneNumber,
      phoneVerified: user.phoneVerified,
      name: user.name || undefined,
      email: user.email || undefined,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error verifying OTP",
      error: error.message,
    });
  }
};
