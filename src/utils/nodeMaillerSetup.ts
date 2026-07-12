import nodemailer from "nodemailer";
import { validEnv } from "../validator/envValidator.js";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: validEnv.GMAIL,
    pass: validEnv.APP_PASSWORD,
  },
  pool: true, // reuse connections instead of opening one per mail — much faster under load
  maxConnections: 5,
  maxMessages: 100,
});

transporter.verify((err) => {
  if (err) console.error("Mail transporter config error:", err);
});
