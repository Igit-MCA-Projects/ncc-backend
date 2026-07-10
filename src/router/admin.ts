import { Router } from "express";
import { authMiddleware } from "../middleware/authmiddleware.js";
import { completeProfile } from "../controllers/admin/completeProfile.js";
import { getProfile } from "../controllers/admin/getProfile.js";
import { updateProfile } from "../controllers/admin/updateProfile.js";
import { adminMiddleware } from "../middleware/admin.js";
import { postJob } from "../controllers/admin/job/postJob.js";
import { getJob } from "../controllers/admin/job/getJob.js";
import { updateJob } from "../controllers/admin/job/updateJob.js";
import { postHiringCalender } from "../controllers/admin/hiringCalender/postHiringCalender.js";
import { getHiringCalender } from "../controllers/admin/hiringCalender/getHiringCalender.js";
import { updateHiringcalender } from "../controllers/admin/hiringCalender/updateHirinCalender.js";

const adminRouter = Router();

adminRouter.post("/profile", authMiddleware, completeProfile);
adminRouter.get("/profile", authMiddleware, getProfile);
adminRouter.put("/profile", authMiddleware, updateProfile);
adminRouter.post("/job", authMiddleware, adminMiddleware, postJob);
adminRouter.get("/job", authMiddleware, getJob);
adminRouter.put("/job", authMiddleware, adminMiddleware, updateJob);
adminRouter.post(
  "/hiring-calender",
  authMiddleware,
  adminMiddleware,
  postHiringCalender,
);
adminRouter.get("/hiring-calender", authMiddleware, getHiringCalender);
adminRouter.put(
  "hiring-calender",
  authMiddleware,
  adminMiddleware,
  updateHiringcalender,
);

export { adminRouter };
