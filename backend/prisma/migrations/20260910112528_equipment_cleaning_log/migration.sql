-- CreateEnum
CREATE TYPE "EquipmentStatus" AS ENUM ('active', 'retired');

-- CreateEnum
CREATE TYPE "CleaningRecordStatus" AS ENUM ('pending', 'verified');

-- CreateEnum
CREATE TYPE "CleaningRecordAuditAction" AS ENUM ('CREATED', 'UPDATED');

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "EquipmentStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CleaningRecord" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "cleanedBy" TEXT NOT NULL,
    "cleanedAt" TIMESTAMP(3) NOT NULL,
    "method" TEXT NOT NULL,
    "notes" TEXT,
    "status" "CleaningRecordStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CleaningRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CleaningRecordAudit" (
    "id" TEXT NOT NULL,
    "cleaningRecordId" TEXT NOT NULL,
    "action" "CleaningRecordAuditAction" NOT NULL,
    "field" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "changedBy" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CleaningRecordAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CleaningRecord_equipmentId_cleanedAt_id_idx" ON "CleaningRecord"("equipmentId", "cleanedAt" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "CleaningRecordAudit_cleaningRecordId_idx" ON "CleaningRecordAudit"("cleaningRecordId");

-- AddForeignKey
ALTER TABLE "CleaningRecord" ADD CONSTRAINT "CleaningRecord_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CleaningRecordAudit" ADD CONSTRAINT "CleaningRecordAudit_cleaningRecordId_fkey" FOREIGN KEY ("cleaningRecordId") REFERENCES "CleaningRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
