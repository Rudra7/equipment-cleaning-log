import { describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  equipment: {
    count: vi.fn(),
    findMany: vi.fn(),
  },
  transaction: vi.fn(),
}));

vi.mock("../src/lib/prisma.ts", () => ({
  prisma: {
    equipment: prismaMock.equipment,
    $transaction: prismaMock.transaction,
  },
}));

import { getAllEquipments } from "../src/services/equipment.service.ts";
import { validateCleaningRecordListQuery } from "../src/validators/cleaning-record.validation.ts";
import {
  RequestValidationError,
  validateEquipmentListQuery,
} from "../src/validators/equipment.validation.ts";

describe("pagination validation", () => {
  it("defaults equipment pagination and accepts a page greater than one", () => {
    expect(validateEquipmentListQuery({})).toEqual({ page: 1, pageSize: 10 });
    expect(validateEquipmentListQuery({ page: "2", pageSize: "100" })).toEqual({
      page: 2,
      pageSize: 100,
    });
  });

  it("rejects invalid equipment pagination values", () => {
    expect(() => validateEquipmentListQuery({ page: "0" })).toThrow(
      RequestValidationError,
    );
    expect(() => validateEquipmentListQuery({ pageSize: "101" })).toThrow(
      "pageSize must not exceed 100.",
    );
  });

  it("accepts later pages for cleaning-record pagination", () => {
    expect(
      validateCleaningRecordListQuery({
        equipmentId: "5b8880e8-e154-42b4-b131-9a831baedc46",
        page: "2",
        pageSize: "20",
      }),
    ).toMatchObject({ page: 2, pageSize: 20 });
  });
});

describe("equipment pagination service", () => {
  it("uses offset pagination and returns total metadata", async () => {
    const items = [{ id: "equipment-11" }];
    prismaMock.equipment.findMany.mockReturnValue("find-many-operation");
    prismaMock.equipment.count.mockReturnValue("count-operation");
    prismaMock.transaction.mockResolvedValue([items, 21]);

    await expect(getAllEquipments({ page: 2, pageSize: 10 })).resolves.toEqual({
      items,
      pagination: {
        page: 2,
        pageSize: 10,
        totalItems: 21,
        totalPages: 3,
      },
    });

    expect(prismaMock.equipment.findMany).toHaveBeenCalledWith({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: 10,
      take: 10,
    });
    expect(prismaMock.transaction).toHaveBeenCalledWith([
      "find-many-operation",
      "count-operation",
    ]);
  });
});
