import { Router } from "express";
import { authMiddleware } from "../middleware/authmiddleware.js";
import { completeProfile } from "../controllers/student/completeProfile.js";
import { getProfile } from "../controllers/student/getProfile.js";
import { updateProfile } from "../controllers/student/updateProfile.js";
import { completeNccProfile } from "../controllers/student/completeNccProfile.js";
import { getNccProfile } from "../controllers/student/getNccProfile.js";
import { updateNccProfile } from "../controllers/student/updateNccProfile.js";
import { applyMentorship } from "../controllers/student/mentor/applyForMentorShip.js";
import { viewMentorshipStatus } from "../controllers/student/mentor/viewMentorShipStatus.js";
import { deleteMentroShip } from "../controllers/student/mentor/deleteMentorShip.js";
import { getAllMentor } from "../controllers/student/mentor/getAllMentors.js";
import { getPersonalNotification } from "../controllers/student/getPersonalNotification.js";
import {
  deleteSavedJob,
  getSavedJob,
  saveJob,
} from "../controllers/student/job.js";
import { getRecomendedJob } from "../controllers/job/getRecomendedJob.js";
import { studentContext } from "../controllers/student/getStudentContext.js";

const studentRouter = Router();

// protected routes (requires authentication)
studentRouter.post("/profile", authMiddleware, completeProfile);
studentRouter.get("/profile", authMiddleware, getProfile);
studentRouter.put("/profile", authMiddleware, updateProfile);

studentRouter.post("/ncc-profile", authMiddleware, completeNccProfile);
studentRouter.get("/ncc-profile", authMiddleware, getNccProfile);
studentRouter.put("/ncc-profile", authMiddleware, updateNccProfile);

studentRouter.get("/all-mentor", authMiddleware, getAllMentor);
studentRouter.post("/mentorship", authMiddleware, applyMentorship);
studentRouter.get("/mentorship", authMiddleware, viewMentorshipStatus);
studentRouter.delete("/mentorship", authMiddleware, deleteMentroShip);

studentRouter.get("/notification", authMiddleware, getPersonalNotification);

studentRouter.get("/save-job", authMiddleware, getSavedJob);
studentRouter.post("/save-job", authMiddleware, saveJob);
studentRouter.delete("/save-job", authMiddleware, deleteSavedJob);

studentRouter.get("/recomended-job",authMiddleware,getRecomendedJob)
studentRouter.get("/context",authMiddleware,studentContext)

export { studentRouter };
