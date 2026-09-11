import { Router } from "express";
import {
  createCleaningRecordHandler,
  getCleaningRecordAuditHistoryHandler,
  listCleaningRecordsHandler,
  updateCleaningRecordHandler,
} from "../controllers/cleaning-record.controller.ts";

export const cleaningRecordRouter = Router();

cleaningRecordRouter.get("/", listCleaningRecordsHandler);
cleaningRecordRouter.post("/", createCleaningRecordHandler);
cleaningRecordRouter.patch("/:id", updateCleaningRecordHandler);
cleaningRecordRouter.get("/:id/audit-history", getCleaningRecordAuditHistoryHandler);
