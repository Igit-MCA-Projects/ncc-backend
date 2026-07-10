import { ApiError } from "../../../utils/apiError.js";
import { ApiResponse } from "../../../utils/apiResponse.js";
import type { Request, Response } from "express";
import { db } from "../../../db/prisma.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

const deleteScholarship = asyncHandler(async (req: Request, res: Response) => {
  // get scholarship id from params
  const { id } = req.query;
  if (!id) {
    throw new ApiError(400, "Scholarship id is required");
  }

  // check scholarship exists
  const scholarship = await db.scholarship.findFirst({
    where: { id: id as string, isDeleted: false },
  });

  if (!scholarship) {
    throw new ApiError(404, "Scholarship not found");
  }

  // soft delete
  await db.scholarship.update({
    where: { id: id as string },
    data: { isDeleted: true },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Scholarship deleted successfully", null));
});

export { deleteScholarship };
