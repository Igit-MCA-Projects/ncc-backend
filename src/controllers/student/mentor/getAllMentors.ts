import { ApiError } from "../../../utils/apiError.js";
import { ApiResponse } from "../../../utils/apiResponse.js";
import type { Request, Response } from "express";
import { z } from "zod";
import { db } from "../../../db/prisma.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

const getAllMentor = asyncHandler(async (req: Request, res: Response) => {
  const mentors = await db.admin.findMany({
    where: {
      isActive: true,
      isVerified: true,
      isDeleted: false,
    },
    select: {
      id: true,
      fullName: true,
      designation: true,
      profileImage: true,
      organization: {
        select: {
          name: true,
          logo: true,
          website: true,
        },
      },
    },
    orderBy: {
      fullName: "asc",
    },
  });

  if (!mentors || mentors.length < 0) {
    throw new ApiError(404, "No mentors found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Mentorship status fetched successfully", mentors),
    );
});

export { getAllMentor };
