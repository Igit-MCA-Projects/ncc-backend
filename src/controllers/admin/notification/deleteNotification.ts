import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiError } from "../../../utils/apiError.js";
import { ApiResponse } from "../../../utils/apiResponse.js";
import type { Request, Response } from "express";
import { db } from "../../../db/prisma.js";

const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.query;

  if (!id) {
    throw new ApiError(400, "Notificatio nid is required");
  }

  const notification = await db.notification.findUnique({
    where: {
      id: id as string,
    },
    select: {
      id: true,
    },
  });

  if (!notification) {
    throw new ApiError(400, "No notification found");
  }

  await db.notification.update({
    where: {
      id: notification.id,
    },
    data: {
      isDeleted: true,
    },
  });

  res.status(200).json(new ApiResponse(200, "Notification deleted", null));
});

export { deleteNotification };
