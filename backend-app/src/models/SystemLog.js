import mongoose from 'mongoose';

const systemLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "CREATE",
        "UPDATE",
        "DELETE",
        "LOGIN",
        "LOGOUT",
        "REGISTER",
        "VERIFY_PHONE",
      ],
    },
    entityType: {
      type: String,
      required: true,
      // Add more entity types as needed
      enum: ["User", "Profile", "Settings", "Onboarding"],
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    previousState: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    currentState: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const SystemLog = mongoose.model('SystemLog', systemLogSchema);

export default SystemLog;