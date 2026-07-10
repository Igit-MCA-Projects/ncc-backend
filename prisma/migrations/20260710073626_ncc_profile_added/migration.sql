-- CreateTable
CREATE TABLE "NccProfile" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "FatherFullName" TEXT NOT NULL,
    "MotherFullName" TEXT NOT NULL,
    "photo" TEXT NOT NULL,
    "dateOfBirth" TEXT NOT NULL,
    "aadharNo" TEXT,
    "aadhar" TEXT,
    "nccDirector" TEXT NOT NULL,
    "nccGroupHQ" TEXT NOT NULL,
    "enrolmentNumber" TEXT NOT NULL,
    "nccBattalion" TEXT NOT NULL,
    "nccUnit" TEXT NOT NULL,
    "nccCirtificate" TEXT,
    "nccRank" TEXT,
    "studentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NccProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhysicalMedicalProfile" (
    "id" TEXT NOT NULL,
    "height" TEXT,
    "weight" TEXT,
    "chest" TEXT,
    "runningDistance" TEXT,
    "runningTimeing" TEXT,
    "spectacle" TEXT,
    "flatFoot" TEXT,
    "knockknee" BOOLEAN,
    "ChronicDisease" TEXT,
    "surgeryHistory" TEXT,
    "allergies" TEXT,
    "disability" BOOLEAN,
    "disabilityDesc" TEXT,
    "fitnessCertificate" TEXT,
    "studentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhysicalMedicalProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NccProfile_studentId_key" ON "NccProfile"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "PhysicalMedicalProfile_studentId_key" ON "PhysicalMedicalProfile"("studentId");

-- AddForeignKey
ALTER TABLE "NccProfile" ADD CONSTRAINT "NccProfile_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhysicalMedicalProfile" ADD CONSTRAINT "PhysicalMedicalProfile_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
