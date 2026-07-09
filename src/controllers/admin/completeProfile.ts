import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { z } from "zod";
import type { Request, Response } from "express";
import { db } from "../../db/prisma.js";

const organizationSchema = z.object({
  name: z.string().trim().min(1, { message: "Organization name is required" }),
  email: z
    .string()
    .trim()
    .email({ message: "Valid organization email is required" })
    .optional(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  logo: z.string().url().optional(),
  description: z.string().optional(),
});

const completeProfileSchema = z.object({
  phone: z.string().optional(),
  profileImage: z.string().url().optional(),
  designation: z.string().optional(),
  organization: organizationSchema.optional(),
});

const completeProfile = asyncHandler(async (req: Request, res: Response) => {
  const validRes = completeProfileSchema.safeParse(req.body);
  if (!validRes.success) {
    throw new ApiError(400, "Provided data are invalid", validRes.error.issues);
  }

  const data = validRes.data;

  const adminId = req.id;
  if (!adminId) {
    throw new ApiError(401, "Access denied, authentication required");
  }

  const admin = await db.admin.findUnique({
    where: {
      id: adminId,
      OR:[{role:"SYSTEM_ADMIN"}, {role:"TEACHER"}]
    },
  });



  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }


  const updatedAdmin = await db.$transaction(async (tx) => {
    let organizationId = admin.organizationId;

    if (data.organization) {
      if (organizationId) {
        await tx.organization.update({
          where: {
            id: organizationId,
          },
          data: {
            name: data.organization.name,
            email: data.organization.email,
            phone: data.organization.phone,
            website: data.organization.website,
            logo: data.organization.logo,
            description: data.organization.description,
          },
        });
      } else {
        const organization = await tx.organization.create({
          data: {
            name: data.organization.name,
            email: data.organization.email,
            phone: data.organization.phone,
            website: data.organization.website,
            logo: data.organization.logo,
            description: data.organization.description,
          },
        });

        organizationId = organization.id;
      }
    }

    await tx.admin.update({
      where: {
        id: adminId,
      },
      data: {
        phone: data.phone,
        profileImage: data.profileImage,
        designation: data.designation,
        organizationId,
      },
    });

    return await tx.admin.findUnique({
      where: {
        id: adminId,
      },
      include: {
        organization: true,
      },
    });
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Profile completed successfully",null));
});

export { completeProfile };
