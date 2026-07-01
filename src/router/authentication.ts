import { Router } from "express";
import { studentRegister } from "../controllers/authentication/studentRegister.js";
import { verifyEmail } from "../controllers/authentication/verifyEmail.js";
import { studentLogin } from "../controllers/authentication/login.js";
import { loginLimiter } from "../utils/ratelimmeter.js";

const authRouter = Router();

authRouter.route("/register").post(studentRegister);
authRouter.route("/verify-email").post(verifyEmail);
authRouter.route("/student-login").post(loginLimiter, studentLogin);

export { authRouter };
