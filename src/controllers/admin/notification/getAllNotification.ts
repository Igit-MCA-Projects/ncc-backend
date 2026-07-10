import { ApiError } from "../../../utils/apiError.js";
import { ApiResponse } from "../../../utils/apiResponse.js";
import type { Request, Response } from "express";
import { z } from "zod";
import { db } from "../../../db/prisma.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

const getNotificationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

const getNotification = asyncHandler(async (req: Request, res: Response) => {
  const validRes = getNotificationSchema.safeParse(req.query);
  if (!validRes.success) {
    throw new ApiError(400, "Provided data are invalid", validRes.error.issues);
  }

  const { page, limit } = validRes.data;
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    db.notification.findMany({
      where: {
        isDeleted: false,
      },
      select: {
        id: true,
        title: true,
        Descripton: true,
        isDeleted: true,
        studentId: true,
      },
      orderBy: {
        createdAt: "asc",
      },
      skip,
      take: limit,
    }),
    db.student.count({
      where: {},
    }),
  ]);

  return res.status(200).json(
    new ApiResponse(200, "Hiring calenders fetched successfully", {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }),
  );
});

export { getNotification };
