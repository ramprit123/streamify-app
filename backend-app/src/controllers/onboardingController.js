import { upsertStreamUser } from "../config/stream.js";
import Onboarding from "../models/Onboard.js";
import SystemLog from "../models/SystemLog.js";

// @desc    Create onboarding profile
// @route   POST /api/onboarding
// @access  Private
export const createOnboarding = async (req, res) => {
  try {
    const existingProfile = await Onboarding.findOne({ user: req.user._id });
    let onboarding;
    let action;
    let previousState;

    if (existingProfile) {
      // Update existing profile
      previousState = { ...existingProfile.toObject() };
      Object.keys(req.body).forEach((key) => {
        if (existingProfile[key] !== undefined) {
          existingProfile[key] = req.body[key];
        }
      });
      existingProfile.isOnboarded = true;
      onboarding = await existingProfile.save();
      action = "UPDATE";
    } else {
      // Create new profile
      const onboardingData = {
        ...req.body,
        user: req.user._id,
        isOnboarded: true,
      };
      onboarding = await Onboarding.create(onboardingData);
      action = "CREATE";
    }

    try {
      await upsertStreamUser({
        id: req.user._id.toString(),
        ...req.body
      });
      console.log(`Stream user ${action === "CREATE" ? "created" : "updated"} for ${req.user._id}`);
    } catch (StreamError) {
      console.error("Error with Stream user:", StreamError.message);
      // Continue with onboarding process even if Stream update fails
    }

    // Log the operation
    await SystemLog.create({
      user: req.user._id,
      action,
      entityType: "Onboarding",
      entityId: onboarding._id,
      previousState,
      currentState: onboarding,
    });

    res.success(onboarding, action === "CREATE" ? 201 : 200);
  } catch (error) {
    res.error(error.message, 400);
  }
};

// @desc    Get onboarding profile
// @route   GET /api/onboarding
// @access  Private
export const getOnboarding = async (req, res) => {
  try {
    const onboarding = await Onboarding.findOne({ user: req.user._id });
    if (!onboarding) {
      return res.status(404).json({ message: "Onboarding profile not found" });
    }
    res.json(onboarding);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update onboarding profile
// @route   PUT /api/onboarding
// @access  Private
export const updateOnboarding = async (req, res) => {
  try {
    const onboarding = await Onboarding.findOne({ user: req.user._id });
    if (!onboarding) {
      return res.status(404).json({ message: "Onboarding profile not found" });
    }

    const previousState = { ...onboarding.toObject() };

    Object.keys(req.body).forEach((key) => {
      if (onboarding[key] !== undefined) {
        onboarding[key] = req.body[key];
      }
    });

    const updatedOnboarding = await onboarding.save();

    // Log the update
    await SystemLog.create({
      user: req.user._id,
      action: "UPDATE",
      entityType: "Profile",
      entityId: onboarding._id,
      previousState,
      currentState: updatedOnboarding,
    });

    res.json(updatedOnboarding);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete onboarding profile
// @route   DELETE /api/onboarding
// @access  Private
export const deleteOnboarding = async (req, res) => {
  try {
    const onboarding = await Onboarding.findOne({ user: req.user._id });
    if (!onboarding) {
      return res.status(404).json({ message: "Onboarding profile not found" });
    }

    const previousState = { ...onboarding.toObject() };
    await onboarding.remove();

    // Log the deletion
    await SystemLog.create({
      user: req.user._id,
      action: "DELETE",
      entityType: "Profile",
      entityId: onboarding._id,
      previousState,
    });

    res.json({ message: "Onboarding profile removed" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
