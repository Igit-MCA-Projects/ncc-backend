import { Resend } from "resend";
import { validEnv } from "../validator/envValidator.js";

const resend = new Resend(validEnv.RESEND_KEY);

export { resend };
