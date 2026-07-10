import { ApiError } from "../../../utils/apiError.js";
import { ApiResponse } from "../../../utils/apiResponse.js";
import type { Request, Response } from "express";
import { z } from "zod";
import { db } from "../../../db/prisma.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
const getAllMentorshipRequests = asyncHandler(
  async (req: Request, res: Response) => {
    // get admin/teacher id from auth middleware
    const teacherId = req.id;
    if (!teacherId) {
      throw new ApiError(401, "Access denied, authentication required");
    }

    // optional status filter, e.g. ?status=PENDING
    const statusFilter = req.query.status as string | undefined;

    const requests = await db.mentorRequest.findMany({
      where: {
        teacherId,
        isDeleted: false,
        ...(statusFilter
          ? { status: statusFilter as "PENDING" | "ACCEPTED" | "REJECTED" }
          : {}),
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            profileImage: true,
            headline: true,
          },
        },
      },
      orderBy: {
        requestedAt: "desc",
      },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Mentorship requests fetched successfully",
          requests,
        ),
      );
  },
);

export { getAllMentorshipRequests };
