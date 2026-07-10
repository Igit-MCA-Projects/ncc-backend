import { ApiError } from "../../../utils/apiError.js";
import { ApiResponse } from "../../../utils/apiResponse.js";
import type { Request, Response } from "express";
import { z } from "zod";
import { db } from "../../../db/prisma.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

const addScholarshipSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  eligibility: z.string().min(1, { message: "Eligibility is required" }),
  requiredDocument: z.array(z.string()).optional().default([]),
  amount: z.string().min(1, { message: "Amount is required" }),
});

const addScholarship = asyncHandler(async (req: Request, res: Response) => {
  // validate the data
  const validRes = addScholarshipSchema.safeParse(req.body);
  if (!validRes.success) {
    throw new ApiError(400, "Provided data are invalid", validRes.error.issues);
  }
  const data = validRes.data;

  // create scholarship
  const scholarship = await db.scholarship.create({
    data: {
      name: data.name,
      eligibility: data.eligibility,
      requiredDocument: data.requiredDocument,
      amount: data.amount,
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Scholarship added successfully", scholarship));
});

export { addScholarship };
