import rateLimit from "express-rate-limit";
import { ApiResponse } from "./apiResponse.js";
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 15 minutes
  limit: 10,
  message: new ApiResponse(
    429,
    "Too many login attempts, try again after some time",
    null,
  ),

  standardHeaders: true,
  legacyHeaders: false,
});

export { loginLimiter };
