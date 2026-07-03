import { Router } from "express";
import { authMiddleware } from "../middleware/authmiddleware.js";
import { completeProfile } from "../controllers/student/completeProfile.js";
import { getProfile } from "../controllers/student/getProfile.js";
import { updateProfile } from "../controllers/student/updateProfile.js";

const studentRouter = Router();

// protected routes (requires authentication)
studentRouter.post("/profile", authMiddleware, completeProfile);
studentRouter.get("/profile", authMiddleware, getProfile);
studentRouter.put("/profile", authMiddleware, updateProfile);

export { studentRouter };
