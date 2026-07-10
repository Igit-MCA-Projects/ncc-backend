import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { z } from "zod";
import type { Request, Response } from "express";
import { db } from "../../db/prisma.js";

// schema for address data
const addressSchema = z.object({
  type: z.enum(["CURRENT", "PERMANENT", "HOSTEL", "OFFICE", "OTHER"]),
  city: z.string().min(1, { message: "City is required" }),
  district: z.string().min(1, { message: "District is required" }),
  state: z.string().min(1, { message: "State is required" }),
  country: z.string().min(1, { message: "Country is required" }),
  pinCode: z.string().min(1, { message: "Pin code is required" }),
  landMark: z.string().optional(),
  building: z.string().optional(),
  street: z.string().optional(),
});

// schema for education data
const educationSchema = z.object({
  level: z.enum([
    "HIGH_SCHOOL",
    "DIPLOMA",
    "BACHELORS",
    "MASTERS",
    "PHD",
    "CERTIFICATION",
    "OTHER",
  ]),
  institutionName: z
    .string()
    .min(1, { message: "Institution name is required" }),
  boardOrUniversity: z.string().optional(),
  degree: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  percentage: z.number().optional(),
  cgpa: z.number().optional(),
});

// schema for social links data
const socialLinkSchema = z.object({
  platform: z.string().min(1, { message: "Platform is required" }),
  url: z.string().url({ message: "Valid URL is required" }),
});

const completeProfileSchema = z.object({
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
  addresses: z.array(addressSchema).optional(),
  educations: z.array(educationSchema).optional(),
  socialLinks: z.array(socialLinkSchema).optional(),
  skills: z.array(z.string()),
});

const completeProfile = asyncHandler(async (req: Request, res: Response) => {
  // validate the data
  const validRes = completeProfileSchema.safeParse(req.body);
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

  // use transaction to ensure data consistency
  const updatedStudent = await db.$transaction(async (tx) => {
    // update student with basic profile data
    await tx.student.update({
      where: {
        id: studentId,
      },
      data: {
        phone: data.phone,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        gender: data.gender,
        headline: data.headline,
        bio: data.bio,
        profileImage: data.profileImage,
        resumeUrl: data.resumeUrl,
        preferredRole: data.preferredRole,
        preferredLocation: data.preferredLocation,
        expectedSalary: data.expectedSalary,
        willingToRelocate: data.willingToRelocate,
        openToRemote: data.openToRemote,
        skills: data.skills,
        profileCompleted: true,
      },
    });

    // create addresses if provided
    if (data.addresses && data.addresses.length > 0) {
      await tx.address.createMany({
        data: data.addresses.map((address) => ({
          type: address.type,
          city: address.city,
          district: address.district,
          state: address.state,
          country: address.country,
          pinCode: address.pinCode,
          landMark: address.landMark || null,
          building: address.building || null,
          street: address.street || null,
          studentId: studentId,
        })),
      });
    }

    // create educations if provided
    if (data.educations && data.educations.length > 0) {
      await tx.education.createMany({
        data: data.educations.map((education) => ({
          level: education.level,
          institutionName: education.institutionName,
          boardOrUniversity: education.boardOrUniversity || null,
          degree: education.degree || null,
          fieldOfStudy: education.fieldOfStudy || null,
          startDate: new Date(education.startDate),
          endDate: education.endDate ? new Date(education.endDate) : null,
          percentage: education.percentage || null,
          cgpa: education.cgpa || null,
          studentId: studentId,
        })),
      });
    }

    // create social links if provided
    if (data.socialLinks && data.socialLinks.length > 0) {
      await tx.socialLink.createMany({
        data: data.socialLinks.map((socialLink) => ({
          platform: socialLink.platform,
          url: socialLink.url,
          studentId: studentId,
        })),
      });
    }

    // return complete student data with all relations
    return await tx.student.findUnique({
      where: {
        id: studentId,
      },
      include: {
        skills: true,
        addresses: true,
        educations: true,
        socialLinks: true,
      },
    });
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Profile completed successfully", null));
});

export { completeProfile };
