import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { z } from "zod";
import type { Request, Response } from "express";
import { db } from "../../db/prisma.js";

const nccProfileSchema = z.object({
  fullName: z.string().min(1, { message: "Full name is required" }),
  FatherFullName: z
    .string()
    .min(1, { message: "Father's full name is required" }),
  MotherFullName: z
    .string()
    .min(1, { message: "Mother's full name is required" }),
  photo: z.string().min(1, { message: "Photo is required" }),
  dateOfBirth: z.string().min(1, { message: "Date of birth is required" }),
  aadharNo: z.string().optional(),
  aadhar: z.string().optional(),
  nccDirector: z.string().min(1, { message: "NCC director is required" }),
  nccGroupHQ: z.string().min(1, { message: "NCC group HQ is required" }),
  enrolmentNumber: z
    .string()
    .min(1, { message: "Enrolment number is required" }),
  nccBattalion: z.string().min(1, { message: "NCC battalion is required" }),
  nccUnit: z.string().min(1, { message: "NCC unit is required" }),
  nccCirtificate: z.string().optional(),
  nccRank: z.string().optional(),
});

const completeNccProfile = asyncHandler(async (req: Request, res: Response) => {
  // validate the data
  const validRes = nccProfileSchema.safeParse(req.body);
  if (!validRes.success) {
    throw new ApiError(400, "Provided data are invalid", validRes.error.issues);
  }
  const data = validRes.data;

  // get student id from auth middleware
  const studentId = req.id;
  if (!studentId) {
    throw new ApiError(401, "Access denied, authentication required");
  }

  // check if student exists
  const student = await db.student.findFirst({
    where: {
      id: studentId,
    },
  });

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  // check if ncc profile already exists for this student
  const existingNccProfile = await db.nccProfile.findUnique({
    where: {
      studentId: studentId,
    },
  });

  if (existingNccProfile) {
    throw new ApiError(409, "NCC profile already exists for this student");
  }

  // create ncc profile
  const nccProfile = await db.nccProfile.create({
    data: {
      fullName: data.fullName,
      FatherFullName: data.FatherFullName,
      MotherFullName: data.MotherFullName,
      photo: data.photo,
      dateOfBirth: data.dateOfBirth,
      aadharNo: data.aadharNo || null,
      aadhar: data.aadhar || null,
      nccDirector: data.nccDirector,
      nccGroupHQ: data.nccGroupHQ,
      enrolmentNumber: data.enrolmentNumber,
      nccBattalion: data.nccBattalion,
      nccUnit: data.nccUnit,
      nccCirtificate: data.nccCirtificate || null,
      nccRank: data.nccRank || null,
      studentId: studentId,
    },
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, "NCC profile completed successfully", nccProfile),
    );
});
export { completeNccProfile, nccProfileSchema };
