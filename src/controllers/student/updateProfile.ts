
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { z } from "zod";
import type { Request, Response } from "express";
import { db } from "../../db/prisma.js";

// schema for address data - id present means update, absent means create
const addressSchema = z.object({
  id: z.string().optional(),
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

// schema for education data - id present means update, absent means create
const educationSchema = z.object({
  id: z.string().optional(),
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

// schema for social links data - id present means update, absent means create
const socialLinkSchema = z.object({
  id: z.string().optional(),
  platform: z.string().min(1, { message: "Platform is required" }),
  url: z.string().url({ message: "Valid URL is required" }),
});

const updateProfileSchema = z.object({
  fullName: z.string().min(1).optional(),
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
  skills: z.array(z.string()).optional(),
  removedAddressIds: z.array(z.string()).optional(),
  removedEducationIds: z.array(z.string()).optional(),
  removedSocialLinkIds: z.array(z.string()).optional(),
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

  // check if student exists
  const student = await db.student.findFirst({
    where: {
      id: studentId,
      isDeleted: false,
    },
  });

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  // use transaction to ensure data consistency
  const updatedStudent = await db.$transaction(async (tx:any) => {
    // update student with basic profile data (only fields actually sent)
    await tx.student.update({
      where: {
        id: studentId,
      },
      data: {
        fullName: data.fullName,
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
      },
    });

    // remove addresses explicitly marked for deletion
    if (data.removedAddressIds && data.removedAddressIds.length > 0) {
      await tx.address.deleteMany({
        where: {
          id: { in: data.removedAddressIds },
          studentId: studentId,
        },
      });
    }

    // upsert addresses: update if id present, create otherwise
    if (data.addresses && data.addresses.length > 0) {
      for (const address of data.addresses) {
        if (address.id) {
          // ensure the address belongs to this student before updating
          const existing = await tx.address.findFirst({
            where: { id: address.id, studentId: studentId },
          });
          if (!existing) {
            throw new ApiError(404, `Address with id ${address.id} not found`);
          }
          await tx.address.update({
            where: { id: address.id },
            data: {
              type: address.type,
              city: address.city,
              district: address.district,
              state: address.state,
              country: address.country,
              pinCode: address.pinCode,
              landMark: address.landMark || null,
              building: address.building || null,
              street: address.street || null,
            },
          });
        } else {
          await tx.address.create({
            data: {
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
            },
          });
        }
      }
    }

    // remove educations explicitly marked for deletion
    if (data.removedEducationIds && data.removedEducationIds.length > 0) {
      await tx.education.deleteMany({
        where: {
          id: { in: data.removedEducationIds },
          studentId: studentId,
        },
      });
    }

    // upsert educations: update if id present, create otherwise
    if (data.educations && data.educations.length > 0) {
      for (const education of data.educations) {
        if (education.id) {
          const existing = await tx.education.findFirst({
            where: { id: education.id, studentId: studentId },
          });
          if (!existing) {
            throw new ApiError(404, `Education with id ${education.id} not found`);
          }
          await tx.education.update({
            where: { id: education.id },
            data: {
              level: education.level,
              institutionName: education.institutionName,
              boardOrUniversity: education.boardOrUniversity || null,
              degree: education.degree || null,
              fieldOfStudy: education.fieldOfStudy || null,
              startDate: new Date(education.startDate),
              endDate: education.endDate ? new Date(education.endDate) : null,
              percentage: education.percentage || null,
              cgpa: education.cgpa || null,
            },
          });
        } else {
          await tx.education.create({
            data: {
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
            },
          });
        }
      }
    }

    // remove social links explicitly marked for deletion
    if (data.removedSocialLinkIds && data.removedSocialLinkIds.length > 0) {
      await tx.socialLink.deleteMany({
        where: {
          id: { in: data.removedSocialLinkIds },
          studentId: studentId,
        },
      });
    }

    // upsert social links: update if id present, create otherwise
    if (data.socialLinks && data.socialLinks.length > 0) {
      for (const socialLink of data.socialLinks) {
        if (socialLink.id) {
          const existing = await tx.socialLink.findFirst({
            where: { id: socialLink.id, studentId: studentId },
          });
          if (!existing) {
            throw new ApiError(404, `Social link with id ${socialLink.id} not found`);
          }
          await tx.socialLink.update({
            where: { id: socialLink.id },
            data: {
              platform: socialLink.platform,
              url: socialLink.url,
            },
          });
        } else {
          await tx.socialLink.create({
            data: {
              platform: socialLink.platform,
              url: socialLink.url,
              studentId: studentId,
            },
          });
        }
      }
    }

    // return complete updated student data with all relations
    return await tx.student.findUnique({
      where: {
        id: studentId,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        dateOfBirth: true,
        gender: true,
        headline: true,
        bio: true,
        profileImage: true,
        resumeUrl: true,
        skills: true,
        preferredRole: true,
        preferredLocation: true,
        expectedSalary: true,
        willingToRelocate: true,
        openToRemote: true,
        profileCompleted: true,
        profileScore: true,
        addresses: true,
        educations: true,
        socialLinks: true,
      },
    });
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Profile updated successfully", updatedStudent));
});

export { updateProfile };