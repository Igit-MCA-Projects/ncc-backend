import { ApiError } from "../../../utils/apiError.js";
import { ApiResponse } from "../../../utils/apiResponse.js";
import type { Request, Response } from "express";
import { z } from "zod";
import { db } from "../../../db/prisma.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

const deleteMentroShip = asyncHandler(async (req: Request, res: Response) => {
  const { mentorshipId } = req.query;
  const studentId = req.id;

  if (!mentorshipId) {
    throw new ApiError(400, "Mentorship id is required");
  }

  const mentorship = await db.mentorRequest.findFirst({
    where: {
      id: mentorshipId as string,
    },
    select: {
      id: true,
      studentId: true,
    },
  });

  if (!mentorship) {
    throw new ApiError(400, "No mentorship request found");
  }

  if (mentorship.studentId != studentId) {
    throw new ApiError(400, "This mentorship not belong to this student");
  }

  await db.mentorRequest.delete({
    where: {
      id: mentorship.id,
    }
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Mentorship request ommited", null));
});

export { deleteMentroShip };
