import { ApiError } from "../../../utils/apiError.js";
import { ApiResponse } from "../../../utils/apiResponse.js";
import type { Request, Response } from "express";
import { z } from "zod";
import { db } from "../../../db/prisma.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

const organizationSchema = z.object({
  name: z.string().trim().min(1, { message: "Organization name is required" }),
  email: z
    .string()
    .trim()
    .email({ message: "Valid organization email is required" })
    .optional(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  description: z.string().optional(),
});

const postJobSchema = z.object({
  title: z.string().trim().min(1, { message: "Job title is required" }),
  description: z
    .string()
    .trim()
    .min(1, { message: "Job description is required" }),
  jobImage: z.string().url().optional(),
  skills: z
    .array(z.string().trim().min(1))
    .min(1, { message: "At least one skill is required" }),
  applyLink: z.string().url().optional(),
  startDate: z.string().datetime(),
  endData: z.string().datetime().optional(),
  Location: z.string().trim().min(1, { message: "Job location is required" }),
  hirignType: z.enum(["INTERNSHIP", "PARTTME", "FULLTIME"]).optional(),
  ctc: z.string().optional(),
  stipend: z.string().optional(),
  organization: organizationSchema.optional(),
});

const postJob = asyncHandler(async (req: Request, res: Response) => {
  const validRes = postJobSchema.safeParse(req.body);
  if (!validRes.success) {
    throw new ApiError(400, "Provided data are invalid", validRes.error.issues);
  }

  const data = validRes.data;
  const adminId = req.id;

  if (!adminId) {
    throw new ApiError(401, "Access denied, authentication required");
  }

  const createdJob = await db.$transaction(async (tx:any) => {
    let organizationId;
    if (data.organization) {
      const organization = await tx.organization.create({
        data: {
          name: data.organization.name,
          email: data.organization.email,
          phone: data.organization.phone,
          website: data.organization.website,
          description: data.organization.description,
        },
        select: {
          id: true,
        },
      });

      organizationId = organization.id;
    }

    return await tx.job.create({
      data: {
        title: data.title,
        description: data.description,
        jobImage: data.jobImage,
        skills: data.skills,
        applyLink: data.applyLink,
        startDate: new Date(data.startDate),
        endData: data.endData ? new Date(data.endData) : null,
        Location: data.Location,
        hirignType: data.hirignType,
        ctc: data.ctc,
        stipend: data.stipend,
        organizationId: organizationId!,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            website: true,
            description: true,
            isVerified: true,
          },
        },
      },
    });
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Job created successfully", null));
});

export { postJob };
