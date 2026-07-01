import { Router } from "express";
import { studentRegister } from "../controllers/authentication/studentRegister.js";
import {
  verifyEmail,
  verifyEmailAdmin,
} from "../controllers/authentication/verifyEmail.js";
import {
  studentLogin,
  adminLogin,
} from "../controllers/authentication/login.js";
import { loginLimiter, adminLoginLimiter } from "../utils/ratelimmeter.js";
import { adminRegister } from "../controllers/authentication/adminRegister.js";

const authRouter = Router();

authRouter.route("/register").post(studentRegister);
authRouter.route("/verify-email").post(verifyEmail);
authRouter.route("/login").post(loginLimiter, studentLogin);

authRouter.route("/admin-register").post(adminRegister);
authRouter.route("/admin-login").post(adminLoginLimiter, adminLogin);
authRouter.route("/admin-verify-email").post(verifyEmailAdmin);

export { authRouter };
