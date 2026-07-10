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
import { getStudents } from "../controllers/admin/student/getStudents.js";
import { getStudentProfile } from "../controllers/admin/student/getStudentProfile.js";
import { createNotification } from "../controllers/admin/notification/generateNotification.js";
import { deleteNotification } from "../controllers/admin/notification/deleteNotification.js";
import { getNotification } from "../controllers/admin/notification/getAllNotification.js";
import { getAllMentorshipRequests } from "../controllers/admin/mentor/getAllMentorRequest.js";
import { updateMentorshipStatus } from "../controllers/admin/mentor/updateMentorshipStatus.js";
import { addNccBenifit } from "../controllers/admin/nccBenifit/addNccBenifit.js";
import { deleteNccBenifit } from "../controllers/admin/nccBenifit/deleteNccBenifit.js";
import { getNccBenifit } from "../controllers/admin/nccBenifit/getNccBenifit.js";
import { addScholarship } from "../controllers/admin/scholarship/addScholarship.js";
import { deleteScholarship } from "../controllers/admin/scholarship/deleteScholarship.js";
import { getScholarship } from "../controllers/admin/scholarship/getScholarhip.js";

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
  "/hiring-calender",
  authMiddleware,
  adminMiddleware,
  updateHiringcalender,
);

adminRouter.get("/students", authMiddleware, adminMiddleware, getStudents);
adminRouter.get(
  "/student-profile",
  authMiddleware,
  adminMiddleware,
  getStudentProfile,
);

adminRouter.post(
  "/notification",
  authMiddleware,
  adminMiddleware,
  createNotification,
);
adminRouter.get(
  "/notification",
  authMiddleware,
  adminMiddleware,
  getNotification,
);
adminRouter.delete(
  "/notification",
  authMiddleware,
  adminMiddleware,
  deleteNotification,
);

adminRouter.get(
  "/mentorship",
  authMiddleware,
  adminMiddleware,
  getAllMentorshipRequests,
);
adminRouter.put(
  "/mentorship",
  authMiddleware,
  adminMiddleware,
  updateMentorshipStatus,
);

adminRouter.post(
  "/ncc-benifit",
  authMiddleware,
  adminMiddleware,
  addNccBenifit,
);
adminRouter.delete(
  "/ncc-benifit",
  authMiddleware,
  adminMiddleware,
  deleteNccBenifit,
);
adminRouter.get("/ncc-benifit", authMiddleware, adminMiddleware, getNccBenifit);

adminRouter.post(
  "/scholarship",
  authMiddleware,
  adminMiddleware,
  addScholarship,
);
adminRouter.delete(
  "/scholarship",
  authMiddleware,
  adminMiddleware,
  deleteScholarship,
);
adminRouter.get(
  "/scholarship",
  authMiddleware,
  adminMiddleware,
  getScholarship,
);

export { adminRouter };
