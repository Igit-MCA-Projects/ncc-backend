import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiError } from "../../../utils/apiError.js";
import { ApiResponse } from "../../../utils/apiResponse.js";
import { z } from "zod";
import type { Request, Response } from "express";
import { db } from "../../../db/prisma.js";

// schema for creating a notification
const createNotificationSchema = z
  .object({
    title: z.string().min(1, { message: "Title is required" }),
    Descripton: z.string().optional(),
    type: z.enum(["GENERAL", "PERSONAL"]).default("GENERAL"),
    studentId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // personal notifications strictly require a studentId
    if (data.type === "PERSONAL" && !data.studentId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Student id is required for personal notifications",
        path: ["studentId"],
      });
    }
  });

const createNotification = asyncHandler(async (req: Request, res: Response) => {
  // validate the data
  const validRes = createNotificationSchema.safeParse(req.body);
  if (!validRes.success) {
    throw new ApiError(400, "Provided data are invalid", validRes.error.issues);
  }
  const data = validRes.data;

  // if personal, make sure the student actually exists
  if (data.type === "PERSONAL") {
    const student = await db.student.findFirst({
      where: {
        id: data.studentId,
        isDeleted: false,
      },
    });

    if (!student) {
      throw new ApiError(404, "Student not found");
    }
  }

  // create the notification
  const notification = await db.notification.create({
    data: {
      title: data.title,
      Descripton: data.Descripton,
      type: data.type,
      // general notifications ignore any studentId sent by mistake
      studentId: data.type === "PERSONAL" ? data.studentId : null,
    },
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, "Notification created successfully", notification),
    );
});

export { createNotification };
