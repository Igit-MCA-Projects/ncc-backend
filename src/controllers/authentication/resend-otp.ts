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

const studentDataSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address" }),
});

const resendOtp = asyncHandler(async (req: Request, res: Response) => {
  const validRes = studentDataSchema.safeParse(req.body);
  if (!validRes.success) {
    throw new ApiError(400, "Provided data are invalid", validRes.error.issues);
  }
  const data = validRes.data;

  // check user exist or not
  const student = await db.student.findFirst({
    where: {
      email: data.email,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
    },
  });

  if (!student) {
    throw new ApiError(400, "This email is not registerd");
  }

  const otp = generateOTP();

  const hashedOtp = await bcrypt.hash(otp, 1);

  const otpRes = await db.student.update({
    where: {
      id: student.id,
    },
    data: {
      verifyToken: hashedOtp,
    },
  });

  // now send the email to the user
  const mailTemplate = await accountVerificationMailTemplate(
    student.fullName,
    otp,
  );

   sendMail(
    student.email,
    mailTemplate,
    "Verify you email",
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Otp send successfully check email", null));
});

export { resendOtp };
