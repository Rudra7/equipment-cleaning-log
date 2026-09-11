export type EquipmentStatus = "active" | "retired";

export type Equipment = {
  id: string;
  name: string;
  code: string;
  status: EquipmentStatus;
  createdAt: string;
  updatedAt: string;
};

export type EquipmentInput = Pick<Equipment, "name" | "code">;

export type PaginatedEquipment = {
  items: Equipment[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
};

const equipmentEndpoint = "/api/equipment";

export async function loadEquipment(
  page: number,
  pageSize: number,
): Promise<PaginatedEquipment> {
  const search = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  return apiRequest<PaginatedEquipment>(`${equipmentEndpoint}?${search}`);
}

export async function getEquipment(id: string): Promise<Equipment> {
  return apiRequest<Equipment>(`${equipmentEndpoint}/${id}`);
}

export async function equipmentLoader({ request }: LoaderFunctionArgs): Promise<PaginatedEquipment> {
  const requestedPage = Number(new URL(request.url).searchParams.get("page") ?? "1");
  const page = Number.isInteger(requestedPage) && requestedPage >= 1 ? requestedPage : 1;
  return loadEquipment(page, 10);
}

export async function createEquipment(input: EquipmentInput): Promise<Equipment> {
  return apiRequest<Equipment>(equipmentEndpoint, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateEquipment(
  id: string,
  input: EquipmentInput,
): Promise<Equipment> {
  return apiRequest<Equipment>(`${equipmentEndpoint}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function retireEquipment(id: string): Promise<void> {
  await apiRequest<void>(`${equipmentEndpoint}/${id}`, { method: "DELETE" });
}

export async function apiRequest<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(payload?.message ?? "The request could not be completed.");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
import type { LoaderFunctionArgs } from "react-router";
