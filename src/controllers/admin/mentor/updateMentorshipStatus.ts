import { ApiError } from "../../../utils/apiError.js";
import { ApiResponse } from "../../../utils/apiResponse.js";
import type { Request, Response } from "express";
import { z } from "zod";
import { db } from "../../../db/prisma.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

// schema for admin approving/rejecting a request
const updateMentorshipStatusSchema = z.object({
  mentorshipRequestId: z
    .string()
    .min(1, { message: "Mentorship request id is required" }),
  status: z.enum(["ACCEPTED", "REJECTED"]),
});

const updateMentorshipStatus = asyncHandler(
  async (req: Request, res: Response) => {
    // validate the data
    const validRes = updateMentorshipStatusSchema.safeParse(req.body);
    if (!validRes.success) {
      throw new ApiError(
        400,
        "Provided data are invalid",
        validRes.error.issues,
      );
    }
    const { status, mentorshipRequestId } = validRes.data;

    // get admin/teacher id from auth middleware
    const teacherId = req.id;

    if (!teacherId) {
      throw new ApiError(401, "Access denied, authentication required");
    }

    // check the request exists and belongs to this mentor
    const mentorRequest = await db.mentorRequest.findFirst({
      where: {
        id: mentorshipRequestId,
        teacherId,
        isDeleted: false,
      },
    });

    if (!mentorRequest) {
      throw new ApiError(404, "Mentorship request not found");
    }

    if (mentorRequest.status !== "PENDING") {
      throw new ApiError(
        409,
        "This mentorship request has already been responded to",
      );
    }

    // update the request status
    const updatedRequest = await db.mentorRequest.update({
      where: { id: mentorshipRequestId },
      data: {
        status,
        respondedAt: new Date(),
      },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          `Mentorship request ${status.toLowerCase()} successfully`,
          updatedRequest,
        ),
      );
  },
);

export { updateMentorshipStatus };
