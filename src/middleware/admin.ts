import { asyncHandler } from "../utils/asyncHandler.js";
import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError.js";
import { db } from "../db/prisma.js";

const adminMiddleware = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.id;
    if (!id) {
      throw new ApiError(
        400,
        "Not have access only access to admin and teacher",
      );
    }

    const admin = await db.admin.findFirst({
      where: {
        id: id,
        OR: [{ role: "SYSTEM_ADMIN" }, { role: "TEACHER" }],
      },
      select: {
        id: true,
        isVerified: true,
        isActive: true,
      },
    });

    if (!admin) {
      throw new ApiError(
        400,
        "Not have access only access to admin and teacher",
      );
    }

    if (!admin.isVerified) {
      throw new ApiError(400, "Admin account is not verifyed");
    }

    if (!admin.isActive) {
      throw new ApiError(400, "Admin account is not Active");
    }

    req.id = admin.id;

    next();
  },
);

export { adminMiddleware };
