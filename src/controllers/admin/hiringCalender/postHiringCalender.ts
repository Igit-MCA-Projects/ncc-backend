import { ApiError } from "../../../utils/apiError.js";
import { ApiResponse } from "../../../utils/apiResponse.js";
import type { Request, Response } from "express";
import { z } from "zod";
import { db } from "../../../db/prisma.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

const hiringCalenderSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(1, { message: "Company name is required" }),
  title: z.string().trim().min(1, { message: "Title is required" }),
  description: z.string().trim().min(1, { message: "Description is required" }),
  salaryRange: z
    .string()
    .trim()
    .min(1, { message: "Salary range is required" }),
  hiringMonth: z.string().datetime(),
  applyLink: z.string().url().optional(),
  prepairResource: z.array(z.string().trim().min(1)).optional().default([]),
});

const postHiringCalender = asyncHandler(async (req: Request, res: Response) => {
  const validRes = hiringCalenderSchema.safeParse(req.body);
  if (!validRes.success) {
    throw new ApiError(400, "Provided data are invalid", validRes.error.issues);
  }

  const data = validRes.data;
  const adminId = req.id;

  if (!adminId) {
    throw new ApiError(401, "Access denied, authentication required");
  }

  const createdHiringCalender = await db.hiringCalender.create({
    data: {
      companyName: data.companyName,
      title: data.title,
      description: data.description,
      salaryRange: data.salaryRange,
      hiringMonth: new Date(data.hiringMonth),
      applyLink: data.applyLink,
      prepairResource: data.prepairResource,
    },
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        "Hiring calender created successfully",
        createdHiringCalender,
      ),
    );
});

export { postHiringCalender };
