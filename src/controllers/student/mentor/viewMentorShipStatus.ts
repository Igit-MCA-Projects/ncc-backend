import { ApiError } from "../../../utils/apiError.js";
import { ApiResponse } from "../../../utils/apiResponse.js";
import type { Request, Response } from "express";
import { z } from "zod";
import { db } from "../../../db/prisma.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

const viewMentorshipStatus = asyncHandler(
  async (req: Request, res: Response) => {
    // get student id from auth middleware
    const studentId = req.id;
    if (!studentId) {
      throw new ApiError(401, "Access denied, authentication required");
    }

    // fetch all mentorship requests made by this student
    const requests = await db.mentorRequest.findMany({
      where: {
        studentId,
        isDeleted: false,
      },
      include: {
        teacher: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        requestedAt: "desc",
      },
    });

    if (!requests || requests.length === 0) {
      throw new ApiError(404, "No mentorship requests found");
    }

    // shape response: only reveal contact info once approved
    const formattedRequests = requests.map((request) => {
      const base = {
        id: request.id,
        note: request.note,
        status: request.status,
        requestedAt: request.requestedAt,
        respondedAt: request.respondedAt,
        mentor: {
          id: request.teacher.id,
          fullName: request.teacher.fullName,
        },
      };

      if (request.status === "ACCEPTED") {
        return {
          ...base,
          message: "Mentorship approved. You can now connect with your mentor.",
          mentor: {
            ...base.mentor,
            email: request.teacher.email,
            phone: request.teacher.phone,
          },
        };
      }

      if (request.status === "REJECTED") {
        return {
          ...base,
          message: "Mentorship request was not approved.",
        };
      }

      return {
        ...base,
        message: "Mentorship is pending",
      };
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Mentorship status fetched successfully",
          formattedRequests,
        ),
      );
  },
);

export { viewMentorshipStatus };
