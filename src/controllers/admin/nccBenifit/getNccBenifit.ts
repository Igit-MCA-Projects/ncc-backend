import { ApiError } from "../../../utils/apiError.js";
import { ApiResponse } from "../../../utils/apiResponse.js";
import type { Request, Response } from "express";
import { z } from "zod";
import { db } from "../../../db/prisma.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

const getNccBenifit = asyncHandler(async (req: Request, res: Response) => {
  // validate pagination query params
  const validRes = paginationSchema.safeParse(req.query);
  if (!validRes.success) {
    throw new ApiError(
      400,
      "Provided query params are invalid",
      validRes.error.issues,
    );
  }
  const { page, limit } = validRes.data;
  const skip = (page - 1) * limit;

  // fetch ncc benefits and total count in parallel
  const [nccBenifits, total] = await Promise.all([
    db.nccBenifit.findMany({
      where: { isDeleted: false },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    db.nccBenifit.count({
      where: { isDeleted: false },
    }),
  ]);

  return res.status(200).json(
    new ApiResponse(200, "NCC benefits fetched successfully", {
      nccBenifits,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }),
  );
});

export { getNccBenifit };
