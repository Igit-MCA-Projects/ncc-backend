import { ApiError } from "../../../utils/apiError.js";
import { ApiResponse } from "../../../utils/apiResponse.js";
import type { Request, Response } from "express";
import { z } from "zod";
import { db } from "../../../db/prisma.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

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
  description: z.string().optional(),
});

const updateJobSchema = z.object({
  jobId: z.string().trim().min(1, { message: "Job id is required" }),
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  jobImage: z.string().url().optional(),
  skills: z.array(z.string().trim().min(1)).optional(),
  applyLink: z.string().url().optional(),
  startDate: z.string().datetime().optional(),
  endData: z.string().datetime().optional(),
  Location: z.string().trim().min(1).optional(),
  hirignType: z.enum(["INTERNSHIP", "PARTTME", "FULLTIME"]).optional(),
  ctc: z.string().optional(),
  stipend: z.string().optional(),
  organization: organizationSchema.optional(),
});

const updateJob = asyncHandler(async (req: Request, res: Response) => {
  const validRes = updateJobSchema.safeParse(req.body);
  if (!validRes.success) {
    throw new ApiError(400, "Provided data are invalid", validRes.error.issues);
  }

  const data = validRes.data;
  const adminId = req.id;
  if (!adminId) {
    throw new ApiError(401, "Access denied, authentication required");
  }

  const job = await db.job.findFirst({
    where: {
      id: data.jobId,
      isDeleted: false,
    },
  });

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  const updateData: Record<string, unknown> = {};
  const organizationData: Record<string, unknown> = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.jobImage !== undefined) updateData.jobImage = data.jobImage;
  if (data.skills !== undefined) updateData.skills = data.skills;
  if (data.applyLink !== undefined) updateData.applyLink = data.applyLink;
  if (data.startDate !== undefined)
    updateData.startDate = new Date(data.startDate);
  if (data.endData !== undefined)
    updateData.endData = data.endData ? new Date(data.endData) : null;
  if (data.Location !== undefined) updateData.Location = data.Location;
  if (data.hirignType !== undefined) updateData.hirignType = data.hirignType;
  if (data.ctc !== undefined) updateData.ctc = data.ctc;
  if (data.stipend !== undefined) updateData.stipend = data.stipend;

  if (data.organization?.name !== undefined)
    organizationData.name = data.organization.name;
  if (data.organization?.email !== undefined)
    organizationData.email = data.organization.email;
  if (data.organization?.phone !== undefined)
    organizationData.phone = data.organization.phone;
  if (data.organization?.website !== undefined)
    organizationData.website = data.organization.website;
  if (data.organization?.description !== undefined)
    organizationData.description = data.organization.description;

  const updatedJob = await db.$transaction(async (tx) => {
    if (Object.keys(organizationData).length > 0) {
      await tx.organization.update({
        where: {
          id: job.organizationId,
        },
        data: organizationData,
      });
    }

    return await tx.job.update({
      where: {
        id: data.jobId,
      },
      data: updateData,
      include: {
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
          },
        },
      },
    });
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Job updated successfully", updatedJob));
});

export { updateJob };
