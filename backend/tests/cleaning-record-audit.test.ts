import { describe, expect, it } from "vitest";
import {
  buildCreationAuditChanges,
  buildUpdateAuditChanges,
} from "../src/utils/cleaning-record-audit.ts";

const baselineRecord = {
  cleanedBy: "jordan.lee@cleen.local",
  cleanedAt: new Date("2026-09-10T08:30:00.000Z"),
  method: "Clean-in-place",
  notes: null,
  status: "pending",
};

describe("cleaning-record audit diff", () => {
  it("creates one audit change per tracked field, including null notes", () => {
    expect(buildCreationAuditChanges(baselineRecord)).toEqual([
      { field: "cleanedBy", oldValue: null, newValue: "jordan.lee@cleen.local" },
      { field: "cleanedAt", oldValue: null, newValue: "2026-09-10T08:30:00.000Z" },
      { field: "method", oldValue: null, newValue: "Clean-in-place" },
      { field: "notes", oldValue: null, newValue: null },
      { field: "status", oldValue: null, newValue: "pending" },
    ]);
  });

  it("does not create audit changes for a semantic date no-op", () => {
    const changes = buildUpdateAuditChanges(baselineRecord, {
      cleanedAt: new Date("2026-09-10T08:30:00Z"),
      notes: null,
    });

    expect(changes).toEqual([]);
  });

  it("tracks null-to-value changes for notes", () => {
    expect(
      buildUpdateAuditChanges(baselineRecord, {
        notes: "Completed after the morning production run.",
      }),
    ).toEqual([
      {
        field: "notes",
        oldValue: null,
        newValue: "Completed after the morning production run.",
      },
    ]);
  });

  it("tracks only changed fields in a partial update", () => {
    expect(
      buildUpdateAuditChanges(baselineRecord, {
        cleanedBy: "priya.shah@cleen.local",
        status: "verified",
      }),
    ).toEqual([
      {
        field: "cleanedBy",
        oldValue: "jordan.lee@cleen.local",
        newValue: "priya.shah@cleen.local",
      },
      { field: "status", oldValue: "pending", newValue: "verified" },
    ]);
  });
});
