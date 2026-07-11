import { Router } from "express";
import { getHiringCalender } from "../controllers/admin/hiringCalender/getHiringCalender.js";
import { getJob } from "../controllers/admin/job/getJob.js";
import { getScholarship } from "../controllers/admin/scholarship/getScholarhip.js";
import { getNccBenifit } from "../controllers/admin/nccBenifit/getNccBenifit.js";
import { getGeneralNotification } from "../controllers/public/getGeneralNotification.js";

const publicRouter = Router();

publicRouter.get("/hiring-calender", getHiringCalender);
publicRouter.get("/jobs", getJob);
publicRouter.get("/scholarship", getScholarship);
publicRouter.get("/ncc-benifit", getNccBenifit);
publicRouter.get("/notification", getGeneralNotification);

export { publicRouter };
