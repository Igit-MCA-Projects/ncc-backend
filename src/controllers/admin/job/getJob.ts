import { ApiError } from "../../../utils/apiError.js";
import { ApiResponse } from "../../../utils/apiResponse.js";
import type { Request, Response } from "express";
import { db } from "../../../db/prisma.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

const getJob = asyncHandler(async (req: Request, res: Response) => {
  const jobs = await db.job.findMany({
    where: {},
    orderBy: {
      createdAt: "desc",
    },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          website: true,
          logo: true,
          description: true,
          isVerified: true,
        },
      },
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Jobs fetched successfully", jobs));
});

export { getJob };
