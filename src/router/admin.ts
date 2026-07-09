import { Router } from "express";
import { authMiddleware } from "../middleware/authmiddleware.js";
import { completeProfile } from "../controllers/admin/completeProfile.js";
import { getProfile } from "../controllers/admin/getProfile.js";
import { updateProfile } from "../controllers/admin/updateProfile.js";

const adminRouter = Router();

adminRouter.post("/profile", authMiddleware, completeProfile);
adminRouter.get("/profile", authMiddleware, getProfile);
adminRouter.put("/profile", authMiddleware, updateProfile);

export { adminRouter };