import type { Request, Response } from "express";
import {
  createEquipment,
  getAllEquipments,
  getEquipmentById,
  retireEquipment,
  updateEquipment,
} from "../services/equipment.service.ts";
import {
  RequestValidationError,
  validateCreateEquipment,
  validateEquipmentId,
  validateEquipmentListQuery,
  validateUpdateEquipment,
} from "../validators/equipment.validation.ts";

export const listEquipment = async (req: Request, res: Response) => {
  try {
    const query = validateEquipmentListQuery(req.query);
    const equipment = await getAllEquipments(query);
    res.status(200).json(equipment);
  } catch (error) {
    sendRequestError(res, error);
  }
};

export const getEquipment = async (req: Request, res: Response) => {
  try {
    const id = validateEquipmentId(req.params.id);
    const equipment = await getEquipmentById(id);

    if (!equipment) {
      res.status(404).json({ message: "Equipment not found." });
      return;
    }

    res.status(200).json(equipment);
  } catch (error) {
    sendRequestError(res, error);
  }
};

export const createEquipmentHandler = async (req: Request, res: Response) => {
  try {
    const input = validateCreateEquipment(req.body);
    const equipment = await createEquipment(input);
    res.status(201).json(equipment);
  } catch (error) {
    sendRequestError(res, error);
  }
};

export const updateEquipmentHandler = async (req: Request, res: Response) => {
  try {
    const id = validateEquipmentId(req.params.id);
    const input = validateUpdateEquipment(req.body);
    const equipment = await updateEquipment(id, input);

    if (!equipment) {
      res.status(404).json({ message: "Equipment not found." });
      return;
    }

    res.status(200).json(equipment);
  } catch (error) {
    sendRequestError(res, error);
  }
};

export const deleteEquipment = async (req: Request, res: Response) => {
  try {
    const id = validateEquipmentId(req.params.id);
    const equipment = await retireEquipment(id);

    if (!equipment) {
      res.status(404).json({ message: "Equipment not found." });
      return;
    }

    res.status(204).send();
  } catch (error) {
    sendRequestError(res, error);
  }
};

function sendRequestError(res: Response, error: unknown) {
  if (error instanceof RequestValidationError) {
    res.status(400).json({ message: error.message });
    return;
  }

  sendUnexpectedError(res, error);
}

function sendUnexpectedError(res: Response, error: unknown) {
  console.error(error);
  res.status(500).json({ message: "An unexpected error occurred." });
}
