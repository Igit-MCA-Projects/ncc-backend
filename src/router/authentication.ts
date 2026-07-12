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
import { logout } from "../controllers/authentication/logout.js";
import { authMiddleware } from "../middleware/authmiddleware.js";
import { resendOtp } from "../controllers/authentication/resend-otp.js";

const authRouter = Router();

authRouter.route("/register").post(studentRegister);
authRouter.route("/verify-email").post(verifyEmail);
authRouter.route("/login").post(loginLimiter, studentLogin);
authRouter.route("/resend-otp").post(resendOtp);

authRouter.route("/admin-register").post(adminRegister);
authRouter.route("/admin-login").post(adminLoginLimiter, adminLogin);
authRouter.route("/admin-verify-email").post(verifyEmailAdmin);

authRouter.route("/logout").post(authMiddleware, logout);

export { authRouter };
