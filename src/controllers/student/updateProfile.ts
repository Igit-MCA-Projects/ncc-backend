import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { z } from "zod";
import type { Request, Response } from "express";
import { db } from "../../db/prisma.js";

const updateProfileSchema = z.object({
  phone: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  headline: z.string().optional(),
  bio: z.string().optional(),
  profileImage: z.string().url().optional(),
  resumeUrl: z.string().url().optional(),
  preferredRole: z.string().optional(),
  preferredLocation: z.array(z.string()).optional(),
  expectedSalary: z.number().int().positive().optional(),
  willingToRelocate: z.boolean().optional(),
  openToRemote: z.boolean().optional(),
  skills: z.array(z.string()).optional(),
});

const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  // validate the data
  const validRes = updateProfileSchema.safeParse(req.body);
  if (!validRes.success) {
    throw new ApiError(400, "Provided data are invalid", validRes.error.issues);
  }
  const data = validRes.data;

  // get student id from auth middleware
  const studentId = req.id;
  if (!studentId) {
    throw new ApiError(401, "Access denied, authentication required");
  }

  // check if student exist
  const student = await db.student.findFirst({
    where: {
      id: studentId,
    },
  });

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  // build update data object - only include fields that are provided
  const updateData: Record<string, any> = {};

  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.dateOfBirth !== undefined)
    updateData.dateOfBirth = new Date(data.dateOfBirth);
  if (data.gender !== undefined) updateData.gender = data.gender;
  if (data.headline !== undefined) updateData.headline = data.headline;
  if (data.bio !== undefined) updateData.bio = data.bio;
  if (data.profileImage !== undefined)
    updateData.profileImage = data.profileImage;
  if (data.resumeUrl !== undefined) updateData.resumeUrl = data.resumeUrl;
  if (data.preferredRole !== undefined)
    updateData.preferredRole = data.preferredRole;
  if (data.preferredLocation !== undefined)
    updateData.preferredLocation = data.preferredLocation;
  if (data.expectedSalary !== undefined)
    updateData.expectedSalary = data.expectedSalary;
  if (data.willingToRelocate !== undefined)
    updateData.willingToRelocate = data.willingToRelocate;
  if (data.openToRemote !== undefined)
    updateData.openToRemote = data.openToRemote;
  if (data.skills !== undefined) updateData.skills = data.skills;

  // update student profile
  const updatedStudent = await db.student.update({
    where: {
      id: studentId,
    },
    data: updateData,
    include: {
      addresses: {
        select: {
          id: true,
          type: true,
          city: true,
          district: true,
          state: true,
          country: true,
          pinCode: true,
          landMark: true,
          building: true,
          street: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      educations: {
        select: {
          id: true,
          level: true,
          institutionName: true,
          boardOrUniversity: true,
          degree: true,
          fieldOfStudy: true,
          startDate: true,
          endDate: true,
          percentage: true,
          cgpa: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      socialLinks: {
        select: {
          id: true,
          platform: true,
          url: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  return res.status(200).json(
    new ApiResponse(200, "Profile updated successfully", {
      id: updatedStudent.id,
      fullName: updatedStudent.fullName,
      email: updatedStudent.email,
      phone: updatedStudent.phone,
      dateOfBirth: updatedStudent.dateOfBirth,
      gender: updatedStudent.gender,
      headline: updatedStudent.headline,
      bio: updatedStudent.bio,
      profileImage: updatedStudent.profileImage,
      resumeUrl: updatedStudent.resumeUrl,
      preferredRole: updatedStudent.preferredRole,
      preferredLocation: updatedStudent.preferredLocation,
      expectedSalary: updatedStudent.expectedSalary,
      willingToRelocate: updatedStudent.willingToRelocate,
      openToRemote: updatedStudent.openToRemote,
      skills: updatedStudent.skills,
      status: updatedStudent.status,
      profileCompleted: updatedStudent.profileCompleted,
      profileScore: updatedStudent.profileScore,
      emailVerified: updatedStudent.emailVerified,
      phoneVerified: updatedStudent.phoneVerified,
      addresses: updatedStudent.addresses,
      educations: updatedStudent.educations,
      socialLinks: updatedStudent.socialLinks,
      createdAt: updatedStudent.createdAt,
      updatedAt: updatedStudent.updatedAt,
    }),
  );
});

export { updateProfile };
