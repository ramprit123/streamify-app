// Core imports
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Middleware imports
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import { loggingMiddleware } from "./middleware/loggingMiddleware.js";
import {
  successResponse,
  errorResponse,
} from "./middleware/responseHandler.js";

// Route imports
import authRoutes from "./routes/authRoutes.js";
import systemLogRoutes from "./routes/systemLogRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import onBoardingRoutes from "./routes/onboardingRoutes.js";

const app = express();

// Security and parsing middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL : true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Application middleware
app.use(loggingMiddleware);
app.use(successResponse);
app.use(errorResponse);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Streamify API" });
});

// Auth routes
app.use("/api/system", systemLogRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/onboarding", onBoardingRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

export default app;
