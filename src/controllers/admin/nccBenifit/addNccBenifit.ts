import { ApiError } from "../../../utils/apiError.js";
import { ApiResponse } from "../../../utils/apiResponse.js";
import type { Request, Response } from "express";
import { z } from "zod";
import { db } from "../../../db/prisma.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

const addNccBenifitSchema = z.object({
  cirtificate: z.string().min(1, { message: "Certificate is required" }),
  benifit: z.string().min(1, { message: "Benefit is required" }),
  Scholarship: z.string().optional(),
  bonusMark: z.string().optional(),
  nccQuota: z.string().optional(),
  scholarships: z.array(z.string()).optional().default([]),
});

const addNccBenifit = asyncHandler(async (req: Request, res: Response) => {
  // validate the data
  const validRes = addNccBenifitSchema.safeParse(req.body);
  if (!validRes.success) {
    throw new ApiError(400, "Provided data are invalid", validRes.error.issues);
  }
  const data = validRes.data;

  // create ncc benefit
  const nccBenifit = await db.nccBenifit.create({
    data: {
      cirtificate: data.cirtificate,
      benifit: data.benifit,
      Scholarship: data.Scholarship,
      bonusMark: data.bonusMark,
      nccQuota: data.nccQuota,
      scholarships: data.scholarships,
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "NCC benefit added successfully", nccBenifit));
});

export { addNccBenifit };
