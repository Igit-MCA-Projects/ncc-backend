/*
  Warnings:

  - The values [RECRUITER] on the enum `AdminRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `type` on the `Organization` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "HiringType" AS ENUM ('INTERNSHIP', 'PARTTME', 'FULLTIME');

-- AlterEnum
BEGIN;
CREATE TYPE "AdminRole_new" AS ENUM ('SYSTEM_ADMIN', 'TEACHER');
ALTER TABLE "Admin" ALTER COLUMN "role" TYPE "AdminRole_new" USING ("role"::text::"AdminRole_new");
ALTER TYPE "AdminRole" RENAME TO "AdminRole_old";
ALTER TYPE "AdminRole_new" RENAME TO "AdminRole";
DROP TYPE "public"."AdminRole_old";
COMMIT;

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "type";

-- DropEnum
DROP TYPE "OrganizationType";

-- CreateTable
CREATE TABLE "HiringCalender" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "skills" TEXT[],
    "line" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endData" TIMESTAMP(3),
    "Location" TEXT NOT NULL,
    "hirignType" "HiringType",
    "ctc" TEXT,
    "stipend" TEXT,
    "organizationId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HiringCalender_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HiringCalender_organizationId_idx" ON "HiringCalender"("organizationId");

-- AddForeignKey
ALTER TABLE "HiringCalender" ADD CONSTRAINT "HiringCalender_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
