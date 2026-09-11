export type CreateEquipmentInput = {
  name: string;
  code: string;
};

export type UpdateEquipmentInput = Partial<CreateEquipmentInput>;

export type EquipmentListQuery = {
  page: number;
  pageSize: number;
};

export class RequestValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RequestValidationError";
  }
}

const mutableEquipmentFields = ["name", "code"] as const;
const listFields = ["page", "pageSize"] as const;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validateEquipmentId(value: string | string[] | undefined): string {
  if (!value || Array.isArray(value) || !uuidPattern.test(value)) {
    throw new RequestValidationError("Equipment id must be a valid UUID.");
  }

  return value;
}

export function validateCreateEquipment(value: unknown): CreateEquipmentInput {
  const body = validateObject(value);
  validateAllowedFields(body, mutableEquipmentFields);

  return {
    name: validateRequiredText(body.name, "name"),
    code: validateRequiredText(body.code, "code"),
  };
}

export function validateUpdateEquipment(value: unknown): UpdateEquipmentInput {
  const body = validateObject(value);
  validateAllowedFields(body, mutableEquipmentFields);

  const input: UpdateEquipmentInput = {};

  for (const field of mutableEquipmentFields) {
    if (Object.hasOwn(body, field)) {
      input[field] = validateRequiredText(body[field], field);
    }
  }

  if (Object.keys(input).length === 0) {
    throw new RequestValidationError("Provide at least one mutable field to update.");
  }

  return input;
}

export function validateEquipmentListQuery(value: unknown): EquipmentListQuery {
  const query = validateObject(value, "Query parameters");
  validateAllowedFields(query, listFields);

  return {
    page: query.page === undefined ? 1 : validatePositiveInteger(query.page, "page"),
    pageSize:
      query.pageSize === undefined
        ? 10
        : validatePositiveInteger(query.pageSize, "pageSize", 100),
  };
}

function validateObject(value: unknown, label = "Request body"): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new RequestValidationError(`${label} must be an object.`);
  }

  return value as Record<string, unknown>;
}

function validateAllowedFields(
  body: Record<string, unknown>,
  allowedFields: readonly string[],
) {
  const invalidField = Object.keys(body).find((key) => !allowedFields.includes(key));

  if (invalidField) {
    throw new RequestValidationError(`Unsupported field: ${invalidField}.`);
  }
}

function validateRequiredText(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new RequestValidationError(`${field} must be a non-empty string.`);
  }

  return value.trim();
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
