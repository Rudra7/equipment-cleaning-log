import { prisma } from "../lib/prisma.ts";
import type {
  CreateEquipmentInput,
  UpdateEquipmentInput,
} from "../validators/equipment.validation.ts";

export const getAllEquipments = async () => {
  return prisma.equipment.findMany({
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
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
