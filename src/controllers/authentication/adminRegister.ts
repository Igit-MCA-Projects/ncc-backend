import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { z } from "zod";
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { db } from "../../db/prisma.js";
import { generateOTP } from "../../helper/generateOtp.js";
import { sendMail } from "../../helper/sendMail.js";
import { accountVerificationMailTemplate } from "../../validator/mailFormat/verifyEmailOtp.js";

const adminDataSchema = z.object({
  fullName: z.string().trim().min(1, { message: "Full name is required" }),

  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address" }),

  password: z.string().min(8, {
    message: "Password must contain at least 8 characters",
  }),
  adminRole: z.enum(["SYSTEM_ADMIN", "TEACHER"]),
});

const adminRegister = asyncHandler(async (req: Request, res: Response) => {
  // validate the data
  const validRes = adminDataSchema.safeParse(req.body);
  if (!validRes.success) {
    throw new ApiError(400, "Provided data are invalid", validRes.error.issues);
  }
  const data = validRes.data;

  // check user exist or not
  const admin = await db.admin.findFirst({
    where: {
      email: data.email,
    },
  });

  if (admin) {
    throw new ApiError(400, "This email is alredy taken");
  }
  // hash the password
  const hashedPassword = await bcrypt.hash(data.password, 2);
  // create the user
  const newAdmin = await db.admin.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      password: hashedPassword,
      role: data.adminRole,
    },
  });

  // generate otp
  const otp = generateOTP();

  // store it in the db by hashing it
  const hashedOtp = await bcrypt.hash(otp, 1);

  const otpRes = await db.admin.update({
    where: {
      id: newAdmin.id,
    },
    data: {
      verifyToken: hashedOtp,
    },
  });

  // now send the email to the user
  const mailTemplate = await accountVerificationMailTemplate(
    newAdmin.fullName,
    otp,
  );

  const mailRes = await sendMail(
    newAdmin.email,
    mailTemplate,
    "Verify you email",
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Account created successfully now verify the eamil",
        null,
      ),
    );
});

export { adminRegister };
