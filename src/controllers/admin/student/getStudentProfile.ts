import { ApiError } from "../../../utils/apiError.js";
import { ApiResponse } from "../../../utils/apiResponse.js";
import type { Request, Response } from "express";
import { z } from "zod";
import { db } from "../../../db/prisma.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

const getStudentProfile = asyncHandler(async (req: Request, res: Response) => {
  // get student id from request params
  const { id } = req.query;

  if (!id) {
    throw new ApiError(400, "Student id is required");
  }

  // fetch student with all related information
  const student = await db.student.findFirst({
    where: {
      id: id as string,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      dateOfBirth: true,
      gender: true,
      headline: true,
      bio: true,
      profileImage: true,
      resumeUrl: true,
      skills: true,
      preferredRole: true,
      preferredLocation: true,
      expectedSalary: true,
      willingToRelocate: true,
      openToRemote: true,
      status: true,
      profileCompleted: true,
      profileScore: true,
      emailVerified: true,
      phoneVerified: true,
      createdAt: true,
      updatedAt: true,
      addresses: true,
      isDeleted: true,
      educations: {
        include: {
          address: true,
        },
      },
      socialLinks: true,
      nccProfile: true,

      // password, verifyToken, isDeleted, deletedAt intentionally excluded
    },
  });

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Student profile fetched successfully", student),
    );
});

export { getStudentProfile };
