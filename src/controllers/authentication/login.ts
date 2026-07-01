import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import { z } from "zod";
import { db } from "../../db/prisma.js";
import { createAccessToken } from "../../helper/createAccessToken.js";
import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validEnv } from "../../validator/envValidator.js";

const loginDataSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, {
    message: "Password must contain at least 8 characters",
  }),
});

const studentLogin = asyncHandler(async (req: Request, res: Response) => {
  const validRes = loginDataSchema.safeParse(req.body);
  if (!validRes.success) {
    throw new ApiError(400, "Invalid data", validRes.error.issues);
  }

  const data = validRes.data;

  //check user existance
  const student = await db.student.findUnique({
    where: {
      email: data.email,
    },
    select: {
      password: true,
      id: true,
    },
  });

  if (!student) {
    throw new ApiError(400, "Email is not exist kindly register");
  }

  // check passwrod
  const passCheck: boolean = await bcrypt.compare(
    data.password,
    student.password as string,
  );

  if (!passCheck) {
    throw new ApiError(400, "The password is not mathch");
  }

  // set the cookie (access token)
  const accesstoken = createAccessToken(student.id);

  res.cookie("accesstoken", `Bearer ${accesstoken}`, {
    httpOnly: true,
    sameSite: validEnv.NODE_ENV === "PROD" ? "none" : "lax",
    secure: validEnv.NODE_ENV === "PROD" ? true : false,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: "/",
  });

  return res.status(200).json(new ApiResponse(200, "Login successfull", null));
});

const adminLogin = asyncHandler(async (req: Request, res: Response) => {
  const validRes = loginDataSchema.safeParse(req.body);
  if (!validRes.success) {
    throw new ApiError(400, "Invalid data", validRes.error.issues);
  }

  const data = validRes.data;

  //check user existance
  const admin = await db.admin.findUnique({
    where: {
      email: data.email,
    },
    select: {
      password: true,
      id: true,
    },
  });

  if (!admin) {
    throw new ApiError(400, "Email is not exist kindly register");
  }

  // check passwrod
  const passCheck: boolean = await bcrypt.compare(
    data.password,
    admin.password as string,
  );

  if (!passCheck) {
    throw new ApiError(400, "The password is not mathch");
  }

  // set the cookie (access token)
  const accesstoken = createAccessToken(admin.id);

  res.cookie("accesstoken", `Bearer ${accesstoken}`, {
    httpOnly: true,
    sameSite: validEnv.NODE_ENV === "PROD" ? "none" : "lax",
    secure: validEnv.NODE_ENV === "PROD" ? true : false,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: "/",
  });

  return res.status(200).json(new ApiResponse(200, "Login successfull", null));
});

export { studentLogin, adminLogin };
