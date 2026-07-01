import rateLimit from "express-rate-limit";
import { ApiResponse } from "./apiResponse.js";
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 200,
  message: new ApiResponse(
    429,
    "Too many login attempts, try again after some time",
    null,
  ),

  standardHeaders: true,
  legacyHeaders: false,
});

const adminLoginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 20,
  message: new ApiResponse(
    429,
    "Too many login attempts, try again after some time",
    null,
  ),

  standardHeaders: true,
  legacyHeaders: false,
});

export { loginLimiter, adminLoginLimiter };
