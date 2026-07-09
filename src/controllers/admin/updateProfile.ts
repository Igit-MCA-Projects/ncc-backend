import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { z } from "zod";
import type { Request, Response } from "express";
import { db } from "../../db/prisma.js";

const organizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Organization name is required" })
    .optional(),
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

const updateProfileSchema = z.object({
  fullName: z.string().trim().min(1).optional(),
  phone: z.string().optional(),
  profileImage: z.string().url().optional(),
  designation: z.string().optional(),
  organization: organizationSchema.optional(),
});

const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const validRes = updateProfileSchema.safeParse(req.body);
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
    },
  });

  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  const updateData: Record<string, unknown> = {};
  const organizationData: Record<string, unknown> = {};

  if (data.fullName !== undefined) updateData.fullName = data.fullName;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.profileImage !== undefined)
    updateData.profileImage = data.profileImage;
  if (data.designation !== undefined) updateData.designation = data.designation;
  if (data.organization?.name !== undefined)
    organizationData.name = data.organization.name;
  if (data.organization?.email !== undefined)
    organizationData.email = data.organization.email;
  if (data.organization?.phone !== undefined)
    organizationData.phone = data.organization.phone;
  if (data.organization?.website !== undefined)
    organizationData.website = data.organization.website;
  if (data.organization?.logo !== undefined)
    organizationData.logo = data.organization.logo;
  if (data.organization?.description !== undefined)
    organizationData.description = data.organization.description;

  const organizationUpdateRequested = Object.keys(organizationData).length > 0;
  const organizationId = admin.organizationId;

  if (organizationUpdateRequested) {
    if (organizationId) {
      await db.organization.update({
        where: {
          id: organizationId,
        },
        data: organizationData,
      });
    } else if (data.organization?.name) {
      const organization = await db.organization.create({
        data: {
          name: data.organization.name,
          email: data.organization.email,
          phone: data.organization.phone,
          website: data.organization.website,
          logo: data.organization.logo,
          description: data.organization.description,
        },
      });

      updateData.organizationId = organization.id;
    }
  }

  const updatedAdmin = await db.admin.update({
    where: {
      id: adminId,
    },
    data: updateData,
    include: {
      organization: true,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Profile updated successfully",null));
});

export { updateProfile };
