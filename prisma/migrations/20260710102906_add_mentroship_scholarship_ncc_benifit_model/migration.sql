-- CreateEnum
CREATE TYPE "MentorRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "NccBenifit" (
    "id" TEXT NOT NULL,
    "cirtificate" TEXT NOT NULL,
    "benifit" TEXT NOT NULL,
    "Scholarship" TEXT,
    "bonusMark" TEXT,
    "nccQuota" TEXT,
    "scholarships" TEXT[],
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NccBenifit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scholarship" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "eligibility" TEXT NOT NULL,
    "requiredDocument" TEXT[],
    "amount" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scholarship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentorRequest" (
    "id" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "status" "MentorRequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MentorRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MentorRequest_studentId_teacherId_key" ON "MentorRequest"("studentId", "teacherId");

-- AddForeignKey
ALTER TABLE "MentorRequest" ADD CONSTRAINT "MentorRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorRequest" ADD CONSTRAINT "MentorRequest_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
