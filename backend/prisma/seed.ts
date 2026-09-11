import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const equipmentToSeed = [
  {
    code: "MIX-001",
    name: "Batch Mixer 01",
    record: {
      cleanedBy: "jordan.lee@cleen.local",
      cleanedAt: new Date("2026-09-01T08:30:00.000Z"),
      method: "Clean-in-place",
      notes: "Completed after the morning production run.",
      status: "verified" as const,
    },
  },
  {
    code: "FILL-002",
    name: "Filling Line 02",
    record: {
      cleanedBy: "samir.patel@cleen.local",
      cleanedAt: new Date("2026-09-02T14:15:00.000Z"),
      method: "Manual washdown",
      notes: null,
      status: "pending" as const,
    },
  },
] as const;

async function main() {
  for (const equipmentSeed of equipmentToSeed) {
    let equipment = await prisma.equipment.findFirst({
      where: { code: equipmentSeed.code },
    });

    if (!equipment) {
      equipment = await prisma.equipment.create({
        data: {
          code: equipmentSeed.code,
          name: equipmentSeed.name,
        },
      });
    }

    const existingRecord = await prisma.cleaningRecord.findFirst({
      where: {
        equipmentId: equipment.id,
        cleanedBy: equipmentSeed.record.cleanedBy,
        cleanedAt: equipmentSeed.record.cleanedAt,
        method: equipmentSeed.record.method,
        notes: equipmentSeed.record.notes,
        status: equipmentSeed.record.status,
      },
    });

    if (existingRecord) {
      continue;
    }

    await prisma.$transaction(async (transaction) => {
      const record = await transaction.cleaningRecord.create({
        data: {
          equipmentId: equipment.id,
          ...equipmentSeed.record,
        },
      });

      await transaction.cleaningRecordAudit.createMany({
        data: [
          { field: "cleanedBy", newValue: record.cleanedBy },
          { field: "cleanedAt", newValue: record.cleanedAt.toISOString() },
          { field: "method", newValue: record.method },
          { field: "notes", newValue: record.notes },
          { field: "status", newValue: record.status },
        ].map((entry) => ({
          cleaningRecordId: record.id,
          action: "CREATED" as const,
          oldValue: null,
          changedBy: "system@cleen.local",
          changedAt: record.createdAt,
          ...entry,
        })),
      });
    });
  }

  console.log("Database seeding completed.");
}

main()
  .catch((error: unknown) => {
    console.error("Database seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
