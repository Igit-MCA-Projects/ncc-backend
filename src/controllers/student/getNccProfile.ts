import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import type { Request, Response } from "express";
import { db } from "../../db/prisma.js";

const getNccProfile = asyncHandler(async (req: Request, res: Response) => {
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

  // fetch ncc profile
  const nccProfile = await db.nccProfile.findUnique({
    where: {
      studentId: studentId,
    },
  });

  if (!nccProfile) {
    throw new ApiError(404, "NCC profile not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "NCC profile fetched successfully", nccProfile));
});

export { getNccProfile };
