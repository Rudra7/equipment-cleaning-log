export type CreateEquipmentInput = {
  name: string;
  code: string;
};

export type UpdateEquipmentInput = Partial<CreateEquipmentInput>;

export class RequestValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RequestValidationError";
  }
}

const mutableEquipmentFields = ["name", "code"] as const;
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

function validateObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new RequestValidationError("Request body must be a JSON object.");
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
