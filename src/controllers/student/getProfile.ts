import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import type { Request, Response } from "express";
import { db } from "../../db/prisma.js";

const getProfile = asyncHandler(async (req: Request, res: Response) => {
  // get student id from auth middleware
  const studentId = req.id;
  if (!studentId) {
    throw new ApiError(401, "Access denied, authentication required");
  }

  // fetch student from database with all related data
  const student = await db.student.findFirst({
    where: {
      id: studentId,
    },
    select: {
      id: true,

      // Basic Information
      fullName: true,
      email: true,
      phone: true,

      dateOfBirth: true,
      gender: true,

      // Profile
      headline: true,
      bio: true,
      profileImage: true,
      resumeUrl: true,

      // Job Preferences
      preferredRole: true,
      preferredLocation: true,
      expectedSalary: true,
      willingToRelocate: true,
      openToRemote: true,
      skills: true,

      // Account
      status: true,
      profileCompleted: true,
      profileScore: true,

      // Verification
      emailVerified: true,
      phoneVerified: true,

      // Soft Delete

      // Audit
      createdAt: true,
      updatedAt: true,

      addresses: {
        select: {
          id: true,
          type: true,
          city: true,
          district: true,
          state: true,
          country: true,
          pinCode: true,
          landMark: true,
          building: true,
          street: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      educations: {
        select: {
          id: true,
          level: true,
          institutionName: true,
          boardOrUniversity: true,
          degree: true,
          fieldOfStudy: true,
          startDate: true,
          endDate: true,
          percentage: true,
          cgpa: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      socialLinks: {
        select: {
          id: true,
          platform: true,
          url: true,
        },
      },
    },
  });

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Profile fetched successfully", student));
});

export { getProfile };
