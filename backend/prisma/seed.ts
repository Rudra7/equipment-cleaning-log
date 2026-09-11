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
    status: "active" as const,
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
    status: "active" as const,
    record: {
      cleanedBy: "samir.patel@cleen.local",
      cleanedAt: new Date("2026-09-02T14:15:00.000Z"),
      method: "Manual washdown",
      notes: null,
      status: "pending" as const,
    },
  },
  {
    code: "TANK-003",
    name: "Ingredient Tank 03",
    status: "active" as const,
    record: {
      cleanedBy: "priya.shah@cleen.local",
      cleanedAt: new Date("2026-09-03T06:45:00.000Z"),
      method: "Steam sanitization",
      notes: "Inspected the outlet valve after cleaning.",
      status: "verified" as const,
    },
  },
  {
    code: "CONV-004",
    name: "Conveyor 04",
    status: "active" as const,
    record: {
      cleanedBy: "morgan.cho@cleen.local",
      cleanedAt: new Date("2026-09-03T15:20:00.000Z"),
      method: "Manual washdown",
      notes: null,
      status: "pending" as const,
    },
  },
  {
    code: "PACK-005",
    name: "Packing Station 05",
    status: "active" as const,
    record: {
      cleanedBy: "jordan.lee@cleen.local",
      cleanedAt: new Date("2026-09-04T09:10:00.000Z"),
      method: "Surface disinfection",
      notes: "Control panel wiped with approved disinfectant.",
      status: "verified" as const,
    },
  },
  {
    code: "CIP-006",
    name: "CIP Skid 06",
    status: "active" as const,
    record: {
      cleanedBy: "samir.patel@cleen.local",
      cleanedAt: new Date("2026-09-04T18:00:00.000Z"),
      method: "Clean-in-place",
      notes: "Cycle completed at standard concentration.",
      status: "verified" as const,
    },
  },
  {
    code: "PUMP-007",
    name: "Transfer Pump 07",
    status: "active" as const,
    record: {
      cleanedBy: "priya.shah@cleen.local",
      cleanedAt: new Date("2026-09-05T07:35:00.000Z"),
      method: "Parts disassembly",
      notes: null,
      status: "pending" as const,
    },
  },
  {
    code: "BLND-008",
    name: "Powder Blender 08",
    status: "active" as const,
    record: {
      cleanedBy: "morgan.cho@cleen.local",
      cleanedAt: new Date("2026-09-05T13:50:00.000Z"),
      method: "Dry clean",
      notes: "Filters were vacuumed and replaced.",
      status: "verified" as const,
    },
  },
  {
    code: "SEAL-009",
    name: "Sealing Machine 09",
    status: "active" as const,
    record: {
      cleanedBy: "jordan.lee@cleen.local",
      cleanedAt: new Date("2026-09-06T10:25:00.000Z"),
      method: "Manual washdown",
      notes: "Awaiting supervisor verification.",
      status: "pending" as const,
    },
  },
  {
    code: "CHIL-010",
    name: "Cooling Chiller 10",
    status: "active" as const,
    record: {
      cleanedBy: "samir.patel@cleen.local",
      cleanedAt: new Date("2026-09-06T19:05:00.000Z"),
      method: "Foam wash",
      notes: "Drain line flushed after rinse cycle.",
      status: "verified" as const,
    },
  },
  {
    code: "LAB-011",
    name: "Quality Lab Bench 11",
    status: "retired" as const,
    record: {
      cleanedBy: "priya.shah@cleen.local",
      cleanedAt: new Date("2026-09-07T08:05:00.000Z"),
      method: "Surface disinfection",
      notes: "Final cleaning entry before retirement.",
      status: "verified" as const,
    },
  },
  {
    code: "WASH-012",
    name: "Parts Washer 12",
    status: "retired" as const,
    record: {
      cleanedBy: "morgan.cho@cleen.local",
      cleanedAt: new Date("2026-09-07T16:40:00.000Z"),
      method: "High-pressure rinse",
      notes: null,
      status: "verified" as const,
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
          status: equipmentSeed.status,
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
