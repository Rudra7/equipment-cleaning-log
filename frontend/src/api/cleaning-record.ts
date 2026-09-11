import type { LoaderFunctionArgs } from "react-router";
import { apiRequest, getEquipment, type Equipment } from "./equipment";

export type CleaningRecordStatus = "pending" | "verified";

export type CleaningRecord = {
  id: string;
  equipmentId: string;
  cleanedBy: string;
  cleanedAt: string;
  method: string;
  notes: string | null;
  status: CleaningRecordStatus;
  createdAt: string;
  updatedAt: string;
};

export type CleaningRecordInput = {
  cleanedBy: string;
  cleanedAt: string;
  method: string;
  notes: string | null;
  status: CleaningRecordStatus;
};

export type AuditEntry = {
  id: string;
  cleaningRecordId: string;
  action: "CREATED" | "UPDATED";
  field: string;
  oldValue: string | null;
  newValue: string | null;
  changedBy: string;
  changedAt: string;
};

export type PaginatedCleaningRecords = {
  items: CleaningRecord[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
};

export type CleaningRecordsLoaderData = {
  equipment: Equipment;
  records: PaginatedCleaningRecords;
};

const endpoint = "/api/cleaning-records";

export async function loadCleaningRecords(
  equipmentId: string,
  page: number,
  pageSize: number,
  status?: CleaningRecordStatus,
): Promise<PaginatedCleaningRecords> {
  const search = new URLSearchParams({
    equipmentId,
    page: String(page),
    pageSize: String(pageSize),
  });

  if (status) {
    search.set("status", status);
  }

  return apiRequest<PaginatedCleaningRecords>(`${endpoint}?${search}`);
}

export async function createCleaningRecord(
  equipmentId: string,
  input: CleaningRecordInput,
): Promise<CleaningRecord> {
  return apiRequest<CleaningRecord>(endpoint, {
    method: "POST",
    body: JSON.stringify({ equipmentId, ...input }),
  });
}

export async function updateCleaningRecord(
  id: string,
  input: CleaningRecordInput,
): Promise<CleaningRecord> {
  return apiRequest<CleaningRecord>(`${endpoint}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function getAuditHistory(id: string): Promise<AuditEntry[]> {
  return apiRequest<AuditEntry[]>(`${endpoint}/${id}/audit-history`);
}

export async function cleaningRecordsLoader({
  params,
  request,
}: LoaderFunctionArgs): Promise<CleaningRecordsLoaderData> {
  const equipmentId = params.equipmentId;

  if (!equipmentId) {
    throw new Response("Equipment id is required.", { status: 400 });
  }

  const searchParams = new URL(request.url).searchParams;
  const requestedPage = Number(searchParams.get("page") ?? "1");
  const page = Number.isInteger(requestedPage) && requestedPage >= 1 ? requestedPage : 1;
  const statusValue = searchParams.get("status");
  const status =
    statusValue === "pending" || statusValue === "verified"
      ? (statusValue as CleaningRecordStatus)
      : undefined;

  const [equipment, records] = await Promise.all([
    getEquipment(equipmentId),
    loadCleaningRecords(equipmentId, page, 20, status),
  ]);

  return { equipment, records };
}
