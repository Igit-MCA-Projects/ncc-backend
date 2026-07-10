import { ApiError } from "../../../utils/apiError.js";
import { ApiResponse } from "../../../utils/apiResponse.js";
import type { Request, Response } from "express";
import { z } from "zod";
import { db } from "../../../db/prisma.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

const updateHiringCalenderSchema = z.object({
  id: z.string().trim().min(1, { message: "Hiring calender id is required" }),
  companyName: z.string().trim().min(1).optional(),
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  salaryRange: z.string().trim().min(1).optional(),
  hiringMonth: z.string().datetime().optional(),
  applyLink: z.string().url().optional(),
  prepairResource: z.array(z.string().trim().min(1)).optional(),
});



const updateHiringcalender = asyncHandler(async (req: Request, res: Response) => {
  const validRes = updateHiringCalenderSchema.safeParse(req.body);
  if (!validRes.success) {
    throw new ApiError(
      400,
      "Provided data are invalid",
      validRes.error.issues,
    );
  }

  const data = validRes.data;
  const adminId = req.id;

  if (!adminId) {
    throw new ApiError(401, "Access denied, authentication required");
  }

  const existingHiringCalender = await db.hiringCalender.findUnique({
    where: {
      id: data.id,
      isDeleted: false,
    },
  });

  if (!existingHiringCalender) {
    throw new ApiError(404, "Hiring calender not found");
  }

  const updatedHiringCalender = await db.hiringCalender.update({
    where: {
      id: data.id,
    },
    data: {
      companyName: data.companyName,
      title: data.title,
      description: data.description,
      salaryRange: data.salaryRange,
      hiringMonth: data.hiringMonth ? new Date(data.hiringMonth) : undefined,
      applyLink: data.applyLink,
      prepairResource: data.prepairResource,
    },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Hiring calender updated successfully",
        updatedHiringCalender,
      ),
    );
});

export {  updateHiringcalender };