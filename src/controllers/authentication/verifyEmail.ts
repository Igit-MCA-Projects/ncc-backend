import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { z } from "zod";
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { db } from "../../db/prisma.js";

const dataSchema = z.object({
  otp: z.string().length(4, { message: "Invalid otp" }),
  email: z.string().email(),
});

const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const validRes = dataSchema.safeParse(req.body);
  if (!validRes.success) {
    throw new ApiError(400, "Invalid data", validRes.error.issues);
  }

  const data = validRes.data;

  // get the user
  const user = await db.student.findUnique({
    where: {
      email: data.email,
    },
    select: {
      verifyToken: true,
      id: true,
    },
  });

  if (!user) {
    throw new ApiError(400, "Provided email is not found");
  }

  const otpCheck: boolean = await bcrypt.compare(
    data.otp,
    user.verifyToken as string,
  );
  if (!otpCheck) {
    throw new ApiError(400, "Invalid otp");
  }
  // update the verify status
  const updateStatus = await db.student.update({
    where: {
      id: user.id,
    },
    data: {
      emailVerified: true,
      verifyToken: null,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Email verifyed login", null));
});

const verifyEmailAdmin = asyncHandler(async (req: Request, res: Response) => {
  const validRes = dataSchema.safeParse(req.body);
  if (!validRes.success) {
    throw new ApiError(400, "Invalid data", validRes.error.issues);
  }

  const data = validRes.data;

  // get the user
  const user = await db.admin.findUnique({
    where: {
      email: data.email,
    },
    select: {
      verifyToken: true,
      id: true,
    },
  });

  if (!user) {
    throw new ApiError(400, "Provided email is not found");
  }

  const otpCheck: boolean = await bcrypt.compare(
    data.otp,
    user.verifyToken as string,
  );
  if (!otpCheck) {
    throw new ApiError(400, "Invalid otp");
  }
  // update the verify status
  const updateStatus = await db.admin.update({
    where: {
      id: user.id,
    },
    data: {
      emailVerifyed: true,
      verifyToken: null,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Email verifyed login", null));
});

export { verifyEmail, verifyEmailAdmin };
