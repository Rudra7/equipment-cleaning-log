import { Router } from "express";
import {
  createEquipmentHandler,
  deleteEquipment,
  getEquipment,
  listEquipment,
  updateEquipmentHandler,
} from "../controllers/equipment.controller.ts";

export const equipmentRouter = Router();

equipmentRouter.get("/", listEquipment);
equipmentRouter.post("/", createEquipmentHandler);
equipmentRouter.get("/:id", getEquipment);
equipmentRouter.patch("/:id", updateEquipmentHandler);
equipmentRouter.delete("/:id", deleteEquipment);
