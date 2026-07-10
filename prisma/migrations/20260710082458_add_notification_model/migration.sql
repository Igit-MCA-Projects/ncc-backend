-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('PERSONAL', 'GENERAL');

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "Descripton" TEXT,
    "studentId" TEXT,
    "type" "NotificationType" NOT NULL DEFAULT 'GENERAL',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
