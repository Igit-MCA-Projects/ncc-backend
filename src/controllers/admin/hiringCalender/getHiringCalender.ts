import { ApiError } from "../../../utils/apiError.js";
import { ApiResponse } from "../../../utils/apiResponse.js";
import type { Request, Response } from "express";
import { z } from "zod";
import { db } from "../../../db/prisma.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

const getHiringCalenderSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

const getHiringCalender = asyncHandler(async (req: Request, res: Response) => {
  const validRes = getHiringCalenderSchema.safeParse(req.query);
  if (!validRes.success) {
    throw new ApiError(400, "Provided data are invalid", validRes.error.issues);
  }

  const { page, limit } = validRes.data;
  const skip = (page - 1) * limit;

  const [hiringCalenders, total] = await Promise.all([
    db.hiringCalender.findMany({
      where: {},
      orderBy: {
        hiringMonth: "asc",
      },
      skip,
      take: limit,
    }),
    db.hiringCalender.count({
      where: {},
    }),
  ]);

  return res.status(200).json(
    new ApiResponse(200, "Hiring calenders fetched successfully", {
      hiringCalenders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }),
  );
});

export { getHiringCalender };
