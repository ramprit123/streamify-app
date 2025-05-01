import mongoose from "mongoose";

// Onboarding schema for user profile
const onboardingSchema = new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
      },
      fullName: {
        type: String,
        trim: true,
        maxLength: [100, "Full name cannot be more than 100 characters"],
      },
      bio: {
        type: String,
        trim: true,
        maxLength: [500, "Bio cannot be more than 500 characters"],
      },
      nativeLanguage: {
        type: String,
        required: [true, "Native language is required"],
        trim: true,
      },
      learningLanguage: [
        {
          language: {
            type: String,
            required: [true, "Learning language is required"],
            trim: true,
          },
          proficiencyLevel: {
            type: String,
            enum: ["beginner", "intermediate", "advanced", "native"],
            default: "beginner",
          },
        },
      ],
      location: {
        country: {
          type: String,
          trim: true,
        },
        city: {
          type: String,
          trim: true,
        },
      },
      interests: [
        {
          type: String,
          trim: true,
        },
      ],
      learningGoals: [
        {
          type: String,
          trim: true,
        },
      ],
      availableForChat: {
        type: Boolean,
        default: true,
      },
      preferredLearningTime: {
        type: String,
        enum: ["morning", "afternoon", "evening", "flexible"],
        default: "flexible",
      },
    },
    {
      timestamps: true,
    }
  );
  
  const Onboarding = mongoose.model("Onboarding", onboardingSchema);
  export default Onboarding;
  