export const auditedCleaningRecordFields = [
  "cleanedBy",
  "cleanedAt",
  "method",
  "notes",
  "status",
] as const;

export type AuditedCleaningRecordField =
  (typeof auditedCleaningRecordFields)[number];

export type AuditedCleaningRecord = {
  cleanedBy: string;
  cleanedAt: Date;
  method: string;
  notes: string | null;
  status: string;
};

export type AuditChange = {
  field: AuditedCleaningRecordField;
  oldValue: string | null;
  newValue: string | null;
};

export function buildCreationAuditChanges(
  record: AuditedCleaningRecord,
): AuditChange[] {
  return auditedCleaningRecordFields.map((field) => ({
    field,
    oldValue: null,
    newValue: normalizeAuditValue(field, record[field]),
  }));
}

export function buildUpdateAuditChanges(
  current: AuditedCleaningRecord,
  update: Partial<AuditedCleaningRecord>,
): AuditChange[] {
  return auditedCleaningRecordFields.flatMap((field) => {
    if (!Object.hasOwn(update, field)) {
      return [];
    }

    const oldValue = normalizeAuditValue(field, current[field]);
    const newValue = normalizeAuditValue(field, update[field]);

    return oldValue === newValue ? [] : [{ field, oldValue, newValue }];
  });
}

function normalizeAuditValue(
  field: AuditedCleaningRecordField,
  value: string | Date | null | undefined,
): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (field === "cleanedAt") {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
      throw new Error("cleanedAt must be a valid Date.");
    }

    return value.toISOString();
  }

  return String(value);
}
