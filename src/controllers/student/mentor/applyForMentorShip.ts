import { ApiError } from "../../../utils/apiError.js";
import { ApiResponse } from "../../../utils/apiResponse.js";
import type { Request, Response } from "express";
import { z } from "zod";
import { db } from "../../../db/prisma.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

// schema for applying for mentorship
const applyMentorshipSchema = z.object({
  teacherId: z.string().min(1, { message: "Teacher id is required" }),
  note: z.string().min(1, { message: "Note is required" }),
});

const applyMentorship = asyncHandler(async (req: Request, res: Response) => {
  // validate the data
  const validRes = applyMentorshipSchema.safeParse(req.body);
  if (!validRes.success) {
    throw new ApiError(400, "Provided data are invalid", validRes.error.issues);
  }
  const { teacherId, note } = validRes.data;

  // get student id from auth middleware
  const studentId = req.id;
  if (!studentId) {
    throw new ApiError(401, "Access denied, authentication required");
  }

  // check teacher (admin/mentor) exists
  const teacher = await db.admin.findFirst({
    where: { id: teacherId },
  });
  if (!teacher) {
    throw new ApiError(404, "Mentor not found");
  }

  // check if a request already exists for this student-teacher pair
  const existingRequest = await db.mentorRequest.findUnique({
    where: {
      studentId_teacherId: {
        studentId,
        teacherId,
      },
    },
  });

  if (existingRequest && !existingRequest.isDeleted) {
    throw new ApiError(
      409,
      "Mentorship request already exists for this mentor",
    );
  }

  // create the mentorship request
  const mentorRequest = await db.mentorRequest.create({
    data: {
      studentId,
      teacherId,
      note,
      status: "PENDING",
    },
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, "Mentorship request submitted successfully", null),
    );
});

export { applyMentorship };
