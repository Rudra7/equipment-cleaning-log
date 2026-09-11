import { RequestValidationError } from "./equipment.validation.ts";

export type CleaningRecordStatusInput = "pending" | "verified";

export type CreateCleaningRecordInput = {
  equipmentId: string;
  cleanedBy: string;
  cleanedAt: Date;
  method: string;
  notes: string | null;
  status: CleaningRecordStatusInput;
};

export type UpdateCleaningRecordInput = Partial<
  Omit<CreateCleaningRecordInput, "equipmentId">
>;

export type CleaningRecordListQuery = {
  equipmentId: string;
  page: number;
  pageSize: number;
  status?: CleaningRecordStatusInput;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const statuses = ["pending", "verified"] as const;
const createFields = [
  "equipmentId",
  "cleanedBy",
  "cleanedAt",
  "method",
  "notes",
  "status",
] as const;
const updateFields = ["cleanedBy", "cleanedAt", "method", "notes", "status"] as const;
const listFields = ["equipmentId", "page", "pageSize", "status"] as const;

export function validateCleaningRecordId(value: string | string[] | undefined): string {
  return validateUuid(value, "Cleaning record id");
}

export function validateCreateCleaningRecord(value: unknown): CreateCleaningRecordInput {
  const body = validateObject(value);
  validateAllowedFields(body, createFields);

  return {
    equipmentId: validateUuid(body.equipmentId, "equipmentId"),
    cleanedBy: validateRequiredText(body.cleanedBy, "cleanedBy"),
    cleanedAt: validateDate(body.cleanedAt, "cleanedAt"),
    method: validateRequiredText(body.method, "method"),
    notes: validateNotes(body.notes),
    status: body.status === undefined ? "pending" : validateStatus(body.status),
  };
}

export function validateUpdateCleaningRecord(value: unknown): UpdateCleaningRecordInput {
  const body = validateObject(value);
  validateAllowedFields(body, updateFields);

  const input: UpdateCleaningRecordInput = {};

  if (Object.hasOwn(body, "cleanedBy")) {
    input.cleanedBy = validateRequiredText(body.cleanedBy, "cleanedBy");
  }
  if (Object.hasOwn(body, "cleanedAt")) {
    input.cleanedAt = validateDate(body.cleanedAt, "cleanedAt");
  }
  if (Object.hasOwn(body, "method")) {
    input.method = validateRequiredText(body.method, "method");
  }
  if (Object.hasOwn(body, "notes")) {
    input.notes = validateNotes(body.notes);
  }
  if (Object.hasOwn(body, "status")) {
    input.status = validateStatus(body.status);
  }

  if (Object.keys(input).length === 0) {
    throw new RequestValidationError("Provide at least one field to update.");
  }

  return input;
}

export function validateCleaningRecordListQuery(
  value: unknown,
): CleaningRecordListQuery {
  const query = validateObject(value);
  validateAllowedFields(query, listFields);

  return {
    equipmentId: validateUuid(query.equipmentId, "equipmentId"),
    page: query.page === undefined ? 1 : validatePositiveInteger(query.page, "page"),
    pageSize:
      query.pageSize === undefined
        ? 20
        : validatePositiveInteger(query.pageSize, "pageSize", 100),
    status: query.status === undefined ? undefined : validateStatus(query.status),
  };
}

function validateUuid(value: unknown, field: string): string {
  if (typeof value !== "string" || !uuidPattern.test(value)) {
    throw new RequestValidationError(`${field} must be a valid UUID.`);
  }

  return value;
}

function validateObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new RequestValidationError("Request body must be a JSON object.");
  }

  return value as Record<string, unknown>;
}

function validateAllowedFields(
  value: Record<string, unknown>,
  allowedFields: readonly string[],
) {
  const unsupportedField = Object.keys(value).find(
    (field) => !allowedFields.includes(field),
  );

  if (unsupportedField) {
    throw new RequestValidationError(`Unsupported field: ${unsupportedField}.`);
  }
}

function validateRequiredText(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new RequestValidationError(`${field} must be a non-empty string.`);
  }

  return value.trim();
}

function validateNotes(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new RequestValidationError("notes must be a string or null.");
  }

  return value.trim();
}

function validateDate(value: unknown, field: string): Date {
  if (typeof value !== "string") {
    throw new RequestValidationError(`${field} must be an ISO-8601 date string.`);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new RequestValidationError(`${field} must be a valid date.`);
  }

  return date;
}

function validateStatus(value: unknown): CleaningRecordStatusInput {
  if (typeof value !== "string" || !statuses.includes(value as CleaningRecordStatusInput)) {
    throw new RequestValidationError("status must be either pending or verified.");
  }

  return value as CleaningRecordStatusInput;
}

function validatePositiveInteger(value: unknown, field: string, maximum?: number): number {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    throw new RequestValidationError(`${field} must be a positive integer.`);
  }

  const numberValue = Number(value);

  if (maximum !== undefined && numberValue > maximum) {
    throw new RequestValidationError(`${field} must not exceed ${maximum}.`);
  }

  return numberValue;
}
