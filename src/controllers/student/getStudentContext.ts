import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import type { Request, Response } from "express";
import { db } from "../../db/prisma.js";

const studentContext = asyncHandler(async (req: Request, res: Response) => {
  const studentId = req.id;

  const student = await db.student.findFirst({
    where: {
      id: studentId,
      isDeleted: false,
    },
    select: {
      fullName: true,
      headline: true,
      bio: true,
      skills: true,
      preferredRole: true,
      preferredLocation: true,
      expectedSalary: true,
      willingToRelocate: true,
      openToRemote: true,
      educations: {
        select: {
          level: true,
          institutionName: true,
          degree: true,
          fieldOfStudy: true,
          percentage: true,
          cgpa: true,
          startDate: true,
          endDate: true,
        },
        orderBy: {
          startDate: "desc",
        },
      },
      addresses: {
        where: {
          type: "PERMANENT",
        },
        select: {
          state: true,
        },
        take: 1,
      },
      nccProfile: {
        select: {
          nccDirector: true,
          nccGroupHQ: true,
          nccBattalion: true,
          nccUnit: true,
          nccRank: true,
          nccCirtificate: true,
          isNccProfileCompleted: true,
        },
      },
    },
  });

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  // Build education summary → { "B.Tech Computer Science": 8.2 (cgpa) or 82 (percentage) }
  const education = student.educations.map((edu:any) => {
    const label =
      [edu.degree, edu.fieldOfStudy].filter(Boolean).join(" - ") || edu.level;
    return label;
  });

  const marks: Record<string, number | null> = {};
  student.educations.forEach((edu:any) => {
    const label =
      [edu.degree, edu.fieldOfStudy].filter(Boolean).join(" - ") || edu.level;
    marks[label] = edu.cgpa ?? edu.percentage ?? null;
  });

  const context = {
    profile: {
      fullName: student.fullName,
      headline: student.headline,
      bio: student.bio,
    },
    skills: student.skills,
    education,
    marks,
    address: {
      state: student.addresses[0]?.state ?? null,
    },
    preferences: {
      preferredRole: student.preferredRole,
      preferredLocation: student.preferredLocation,
      expectedSalary: student.expectedSalary,
      willingToRelocate: student.willingToRelocate,
      openToRemote: student.openToRemote,
    },
    ncc: student.nccProfile
      ? {
          director: student.nccProfile.nccDirector,
          groupHQ: student.nccProfile.nccGroupHQ,
          battalion: student.nccProfile.nccBattalion,
          unit: student.nccProfile.nccUnit,
          rank: student.nccProfile.nccRank,
          certificate: student.nccProfile.nccCirtificate,
          isCompleted: student.nccProfile.isNccProfileCompleted,
        }
      : null,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Student context fetched successfully", context),
    );
});

export { studentContext };
