import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import type { Request, Response } from "express";
import { db } from "../../db/prisma.js";

const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const adminId = req.id;
  if (!adminId) {
    throw new ApiError(401, "Access denied, authentication required");
  }

  const admin = await db.admin.findUnique({
    where: {
      id: adminId,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      profileImage: true,
      designation: true,
      role: true,
      isActive: true,
      isVerified: true,
      emailVerifyed: true,
      createdAt: true,
      updatedAt: true,
      organization: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          website: true,
          logo: true,
          description: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
          admins: {
            select: {
              id: true,
              fullName: true,
              email: true,
              designation: true,
              profileImage: true,
              phone: true,
            },
          },
        },
      },
    },
  });

  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Profile fetched successfully", admin));
});

export { getProfile };
