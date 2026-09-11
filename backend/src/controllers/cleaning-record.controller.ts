import type { Request, Response } from "express";
import {
  createCleaningRecord,
  getCleaningRecordAuditHistory,
  listCleaningRecords,
  updateCleaningRecord,
} from "../services/cleaning-record.service.ts";
import {
  validateCleaningRecordId,
  validateCleaningRecordListQuery,
  validateCreateCleaningRecord,
  validateUpdateCleaningRecord,
} from "../validators/cleaning-record.validation.ts";
import { RequestValidationError } from "../validators/equipment.validation.ts";

export async function listCleaningRecordsHandler(req: Request, res: Response) {
  try {
    const query = validateCleaningRecordListQuery(req.query);
    const result = await listCleaningRecords(query);

    if (!result) {
      res.status(404).json({ message: "Equipment not found." });
      return;
    }

    res.status(200).json(result);
  } catch (error) {
    sendRequestError(res, error);
  }
}

export async function createCleaningRecordHandler(req: Request, res: Response) {
  try {
    const input = validateCreateCleaningRecord(req.body);
    const result = await createCleaningRecord(input, getChangedBy(req));

    if (result.kind === "equipment-not-found") {
      res.status(404).json({ message: "Equipment not found." });
      return;
    }

    if (result.kind === "equipment-retired") {
      res.status(409).json({ message: "Cannot create records for retired equipment." });
      return;
    }

    res.status(201).json(result.record);
  } catch (error) {
    sendRequestError(res, error);
  }
}

export async function updateCleaningRecordHandler(req: Request, res: Response) {
  try {
    const id = validateCleaningRecordId(req.params.id);
    const input = validateUpdateCleaningRecord(req.body);
    const result = await updateCleaningRecord(id, input, getChangedBy(req));

    if (result.kind === "not-found") {
      res.status(404).json({ message: "Cleaning record not found." });
      return;
    }

    res.status(200).json(result.record);
  } catch (error) {
    sendRequestError(res, error);
  }
}

export async function getCleaningRecordAuditHistoryHandler(
  req: Request,
  res: Response,
) {
  try {
    const id = validateCleaningRecordId(req.params.id);
    const auditHistory = await getCleaningRecordAuditHistory(id);

    if (!auditHistory) {
      res.status(404).json({ message: "Cleaning record not found." });
      return;
    }

    res.status(200).json(auditHistory);
  } catch (error) {
    sendRequestError(res, error);
  }
}

function getChangedBy(req: Request): string {
  const value = req.header("X-User-Id")?.trim();
  return value || "system@cleen.local";
}

function sendRequestError(res: Response, error: unknown) {
  if (error instanceof RequestValidationError) {
    res.status(400).json({ message: error.message });
    return;
  }

  console.error(error);
  res.status(500).json({ message: "An unexpected error occurred." });
}
