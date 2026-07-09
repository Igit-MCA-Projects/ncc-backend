import { asyncHandler } from "../utils/asyncHandler.js";
import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError.js";
import { db } from "../db/prisma.js";

const systemAdminMiddleware = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.id;
    if (!id) {
      throw new ApiError(400, "Not have access only access to System Admin");
    }

    const systemAdmin = await db.admin.findFirst({
      where: {
        id: id,
        role: "SYSTEM_ADMIN",
      },
      select: {
        id: true,
      },
    });

    if (!systemAdmin) {
      throw new ApiError(400, "Not have access only access to teacher");
    }

    req.id = systemAdmin.id;

    next();
  },
);

export { systemAdminMiddleware };
