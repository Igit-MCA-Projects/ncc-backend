/*
  Warnings:

  - You are about to drop the column `Location` on the `HiringCalender` table. All the data in the column will be lost.
  - You are about to drop the column `ctc` on the `HiringCalender` table. All the data in the column will be lost.
  - You are about to drop the column `endData` on the `HiringCalender` table. All the data in the column will be lost.
  - You are about to drop the column `hirignType` on the `HiringCalender` table. All the data in the column will be lost.
  - You are about to drop the column `line` on the `HiringCalender` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `HiringCalender` table. All the data in the column will be lost.
  - You are about to drop the column `skills` on the `HiringCalender` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `HiringCalender` table. All the data in the column will be lost.
  - You are about to drop the column `stipend` on the `HiringCalender` table. All the data in the column will be lost.
  - Added the required column `companyName` to the `HiringCalender` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hiringMonth` to the `HiringCalender` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salaryRange` to the `HiringCalender` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "HiringCalender" DROP CONSTRAINT "HiringCalender_organizationId_fkey";

-- DropIndex
DROP INDEX "HiringCalender_organizationId_idx";

-- AlterTable
ALTER TABLE "HiringCalender" DROP COLUMN "Location",
DROP COLUMN "ctc",
DROP COLUMN "endData",
DROP COLUMN "hirignType",
DROP COLUMN "line",
DROP COLUMN "organizationId",
DROP COLUMN "skills",
DROP COLUMN "startDate",
DROP COLUMN "stipend",
ADD COLUMN     "applyLink" TEXT,
ADD COLUMN     "companyName" TEXT NOT NULL,
ADD COLUMN     "hiringMonth" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "prepairResource" TEXT[],
ADD COLUMN     "salaryRange" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "skills" TEXT[],
    "applyLink" TEXT,
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

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Job_organizationId_idx" ON "Job"("organizationId");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
