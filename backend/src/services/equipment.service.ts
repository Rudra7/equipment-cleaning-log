import { prisma } from "../lib/prisma.ts";
import type {
  CreateEquipmentInput,
  EquipmentListQuery,
  UpdateEquipmentInput,
} from "../validators/equipment.validation.ts";

export const getAllEquipments = async (query: EquipmentListQuery) => {
  const [items, totalItems] = await prisma.$transaction([
    prisma.equipment.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.equipment.count(),
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
};

export const getEquipmentById = async (id: string) => {
  return prisma.equipment.findUnique({
    where: { id },
  });
};

export const createEquipment = async (input: CreateEquipmentInput) => {
  return prisma.equipment.create({
    data: input,
  });
};

export const updateEquipment = async (id: string, input: UpdateEquipmentInput) => {
  const equipment = await getEquipmentById(id);

  if (!equipment) {
    return null;
  }

  return prisma.equipment.update({
    where: { id },
    data: input,
  });
};

export const retireEquipment = async (id: string) => {
  const equipment = await getEquipmentById(id);

  if (!equipment || equipment.status === "retired") {
    return equipment;
  }

  return prisma.equipment.update({
    where: { id },
    data: { status: "retired" },
  });
};
