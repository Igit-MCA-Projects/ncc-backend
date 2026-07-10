import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { z } from "zod";
import type { Request, Response } from "express";
import { db } from "../../db/prisma.js";
import { nccProfileSchema } from "./completeNccProfile.js";

const updateNccProfileSchema = nccProfileSchema.partial();

const updateNccProfile = asyncHandler(async (req: Request, res: Response) => {
  // validate the data
  const validRes = updateNccProfileSchema.safeParse(req.body);
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

  // check if ncc profile exists
  const existingNccProfile = await db.nccProfile.findUnique({
    where: {
      studentId: studentId,
    },
  });

  if (!existingNccProfile) {
    throw new ApiError(404, "NCC profile not found");
  }

  // update ncc profile
  const updatedNccProfile = await db.nccProfile.update({
    where: {
      studentId: studentId,
    },
    data: {
      fullName: data.fullName,
      FatherFullName: data.FatherFullName,
      MotherFullName: data.MotherFullName,
      photo: data.photo,
      dateOfBirth: data.dateOfBirth,
      aadharNo: data.aadharNo,
      aadhar: data.aadhar,
      nccDirector: data.nccDirector,
      nccGroupHQ: data.nccGroupHQ,
      enrolmentNumber: data.enrolmentNumber,
      nccBattalion: data.nccBattalion,
      nccUnit: data.nccUnit,
      nccCirtificate: data.nccCirtificate,
      nccRank: data.nccRank,
    },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "NCC profile updated successfully",
        updatedNccProfile,
      ),
    );
});

export { updateNccProfile };
