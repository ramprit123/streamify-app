import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import { loggingMiddleware } from "./middleware/loggingMiddleware.js";

const app = express();
// Middleware
app.use(loggingMiddleware);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
import authRoutes from "./routes/authRoutes.js";
import systemLogRoutes from "./routes/systemLogRoutes.js";
import userRoutes from "./routes/userRoutes.js";

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Streamify API" });
});

// Auth routes
app.use("/api/system", systemLogRoutes);
app.use("/api/users", userRoutes);
app.use('/api/auth', authRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

export default app;