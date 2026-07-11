import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import type { Request, Response } from "express";
import { z } from "zod";
import { db } from "../../db/prisma.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const saveJobSchema = z.object({
  jobId: z.string().min(1, { message: "Job id is required" }),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

const saveJob = asyncHandler(async (req: Request, res: Response) => {
  // validate the data
  const validRes = saveJobSchema.safeParse(req.body);
  if (!validRes.success) {
    throw new ApiError(400, "Provided data are invalid", validRes.error.issues);
  }
  const { jobId } = validRes.data;

  // get student id from auth middleware
  const studentId = req.id;
  if (!studentId) {
    throw new ApiError(401, "Access denied, authentication required");
  }

  // check job exists
  const job = await db.job.findFirst({
    where: { id: jobId },
  });
  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  // check if already saved
  const existingSavedJob = await db.savedJob.findUnique({
    where: {
      studentId_jobId: {
        studentId,
        jobId,
      },
    },
  });

  if (existingSavedJob) {
    throw new ApiError(409, "Job already saved");
  }

  // save the job
  const savedJob = await db.savedJob.create({
    data: {
      studentId,
      jobId,
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Job saved successfully", savedJob));
});

const getSavedJob = asyncHandler(async (req: Request, res: Response) => {
  // validate pagination query params
  const validRes = paginationSchema.safeParse(req.query);
  if (!validRes.success) {
    throw new ApiError(
      400,
      "Provided query params are invalid",
      validRes.error.issues,
    );
  }
  const { page, limit } = validRes.data;
  const skip = (page - 1) * limit;

  // get student id from auth middleware
  const studentId = req.id;
  if (!studentId) {
    throw new ApiError(401, "Access denied, authentication required");
  }

  // fetch saved jobs and total count in parallel, newest job postings first
  const [savedJobs, total] = await Promise.all([
    db.savedJob.findMany({
      where: { studentId },
      skip,
      take: limit,
      orderBy: {
        job: {
          createdAt: "desc",
        },
      },
      include: {
        job: true,
      },
    }),
    db.savedJob.count({
      where: { studentId },
    }),
  ]);

  return res.status(200).json(
    new ApiResponse(200, "Saved jobs fetched successfully", {
      savedJobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }),
  );
});

const deleteSavedJob = asyncHandler(async (req: Request, res: Response) => {
  // get saved job id from params
  const { id } = req.query;
  if (!id) {
    throw new ApiError(400, "Saved job id is required");
  }

  // get student id from auth middleware
  const studentId = req.id;
  if (!studentId) {
    throw new ApiError(401, "Access denied, authentication required");
  }

  // check saved job exists and belongs to this student
  const savedJob = await db.savedJob.findFirst({
    where: { id: id as string, studentId },
  });

  if (!savedJob) {
    throw new ApiError(404, "Saved job not found");
  }

  // hard delete - no isDeleted field on this model
  await db.savedJob.delete({
    where: { id: id as string },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Saved job deleted successfully", null));
});

export { saveJob, getSavedJob, deleteSavedJob };
