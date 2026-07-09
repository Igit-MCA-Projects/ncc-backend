import { asyncHandler } from "../utils/asyncHandler.js";
import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError.js";
import { db } from "../db/prisma.js";

const teacherMiddleware = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.id;
    if (!id) {
      throw new ApiError(400, "Not have access only access to teacher");
    }

    const teacher = await db.admin.findFirst({
      where: {
        id: id,
        role: "TEACHER",
        isVerified: true,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (!teacher) {
      throw new ApiError(400, "Not have access only access to teacher");
    }

    req.id = teacher.id;

    next();
  },
);

export { teacherMiddleware };
