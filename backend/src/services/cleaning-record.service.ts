import { prisma } from "../lib/prisma.ts";
import {
  buildCreationAuditChanges,
  buildUpdateAuditChanges,
} from "../utils/cleaning-record-audit.ts";
import type {
  CleaningRecordListQuery,
  CreateCleaningRecordInput,
  UpdateCleaningRecordInput,
} from "../validators/cleaning-record.validation.ts";

export async function listCleaningRecords(query: CleaningRecordListQuery) {
  const equipment = await prisma.equipment.findUnique({
    where: { id: query.equipmentId },
    select: { id: true },
  });

  if (!equipment) {
    return null;
  }

  const where = {
    equipmentId: query.equipmentId,
    ...(query.status ? { status: query.status } : {}),
  };
  const skip = (query.page - 1) * query.pageSize;
  const [items, totalItems] = await prisma.$transaction([
    prisma.cleaningRecord.findMany({
      where,
      orderBy: [{ cleanedAt: "desc" }, { id: "desc" }],
      skip,
      take: query.pageSize,
    }),
    prisma.cleaningRecord.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / query.pageSize),
    },
  };
}

export async function createCleaningRecord(
  input: CreateCleaningRecordInput,
  changedBy: string,
) {
  return prisma.$transaction(async (transaction) => {
    const equipment = await transaction.equipment.findUnique({
      where: { id: input.equipmentId },
      select: { status: true },
    });

    if (!equipment) {
      return { kind: "equipment-not-found" } as const;
    }

    if (equipment.status === "retired") {
      return { kind: "equipment-retired" } as const;
    }

    const record = await transaction.cleaningRecord.create({ data: input });
    const auditChanges = buildCreationAuditChanges(record);

    await transaction.cleaningRecordAudit.createMany({
      data: auditChanges.map((change) => ({
        cleaningRecordId: record.id,
        action: "CREATED" as const,
        changedBy,
        ...change,
      })),
    });

    return { kind: "created", record } as const;
  });
}

export async function updateCleaningRecord(
  id: string,
  input: UpdateCleaningRecordInput,
  changedBy: string,
) {
  return prisma.$transaction(async (transaction) => {
    const current = await transaction.cleaningRecord.findUnique({ where: { id } });

    if (!current) {
      return { kind: "not-found" } as const;
    }

    const auditChanges = buildUpdateAuditChanges(current, input);

    if (auditChanges.length === 0) {
      return { kind: "unchanged", record: current } as const;
    }

    const record = await transaction.cleaningRecord.update({
      where: { id },
      data: input,
    });

    await transaction.cleaningRecordAudit.createMany({
      data: auditChanges.map((change) => ({
        cleaningRecordId: record.id,
        action: "UPDATED" as const,
        changedBy,
        ...change,
      })),
    });

    return { kind: "updated", record } as const;
  });
}

export async function getCleaningRecordAuditHistory(id: string) {
  const record = await prisma.cleaningRecord.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!record) {
    return null;
  }

  return prisma.cleaningRecordAudit.findMany({
    where: { cleaningRecordId: id },
    orderBy: [{ changedAt: "asc" }, { id: "asc" }],
  });
}
