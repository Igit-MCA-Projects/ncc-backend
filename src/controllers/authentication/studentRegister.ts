import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { z } from "zod";
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { db } from "../../db/prisma.js";
import { generateOTP } from "../../helper/generateOtp.js";
import { sendMail } from "../../helper/sendMail.js";
import { accountVerificationMailTemplate } from "../../mailFormat/verifyEmailOtp.js";

const studentDataSchema = z.object({
  fullName: z.string().trim().min(1, { message: "Full name is required" }),

  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address" }),

  password: z.string().min(8, {
    message: "Password must contain at least 8 characters",
  }),
});

const studentRegister = asyncHandler(async (req: Request, res: Response) => {
  // validate the data
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
  });

  if (student) {
    throw new ApiError(400, "This email is alredy taken");
  }
  // hash the password
  const hashedPassword = await bcrypt.hash(data.password, 2);
  // create the user
  const newStudent = await db.student.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      password: hashedPassword,
    },
  });

  // generate otp
  const otp = generateOTP();

  // store it in the db by hashing it
  const hashedOtp = await bcrypt.hash(otp, 1);

  const otpRes = await db.student.update({
    where: {
      id: newStudent.id,
    },
    data: {
      verifyToken: hashedOtp,
    },
  });

  // now send the email to the user
  const mailTemplate = await accountVerificationMailTemplate(
    newStudent.fullName,
    otp,
  );

  const mailRes = await sendMail(
    newStudent.email,
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

export { studentRegister };
