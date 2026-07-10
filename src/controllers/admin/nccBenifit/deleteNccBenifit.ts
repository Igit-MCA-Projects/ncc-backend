import { ApiError } from "../../../utils/apiError.js";
import { ApiResponse } from "../../../utils/apiResponse.js";
import type { Request, Response } from "express";
import { z } from "zod";
import { db } from "../../../db/prisma.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

const deleteNccBenifit = asyncHandler(async (req: Request, res: Response) => {
  // get ncc benefit id from params
  const { id } = req.query;
  if (!id) {
    throw new ApiError(400, "NCC benefit id is required");
  }

  // check ncc benefit exists
  const nccBenifit = await db.nccBenifit.findFirst({
    where: { id: id as string, isDeleted: false },
  });

  if (!nccBenifit) {
    throw new ApiError(404, "NCC benefit not found");
  }

  // soft delete
  await db.nccBenifit.update({
    where: { id: id as string },
    data: { isDeleted: true },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "NCC benefit deleted successfully", null));
});

export { deleteNccBenifit };
