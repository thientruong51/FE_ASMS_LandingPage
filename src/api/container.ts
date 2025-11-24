import axios from "axios";

const BASE = (import.meta.env.VITE_API_BASE_URL ?? "") as string;
if (!BASE) throw new Error("VITE_API_BASE_URL not defined");

export type ContainerApi = {
  containerCode: string;
  floorCode?: string | null;
  isActive?: boolean;
  status?: string;
  price?: number | null;
  productTypeId?: number;
  maxWeight?: number;
  currentWeight?: number;
  positionX?: number | null;
  positionY?: number | null;
  positionZ?: number | null;
  imageUrl?: string | null;
  type?: string; 
  serialNumber?: number | null;
  layer?: number | null;
  containerAboveCode?: string | null;
  orderDetailId?: number | null;
};

type ApiWrapper<T> = {
  success: boolean;
  data: T;
  pagination?: any;
};

export function letterToContainerTypeId(v?: string | number | null): number | undefined {
  if (v == null) return undefined;
  if (typeof v === "number") return Number(v);
  const s = String(v).trim().toUpperCase();
  const map: Record<string, number> = { A: 1, B: 2, C: 3, D: 4, "A_STORAGE": 5, "B_STORAGE": 6, "C_STORAGE": 7, "D_STORAGE": 8 };
  if (map[s]) return map[s];
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}


export async function fetchContainers(params?: {
  containerTypeId?: number;
  status?: string;
  pageNumber?: number;
  pageSize?: number;
}): Promise<ContainerApi[]> {
  const url = `${BASE}/api/Container`;
  const res = await axios.get<ApiWrapper<ContainerApi[]>>(url, {
    params: {
      ...(params?.containerTypeId ? { containerTypeId: params.containerTypeId } : {}),
      ...(params?.status ? { status: params.status } : {}),
      pageNumber: params?.pageNumber ?? 1,
      pageSize: params?.pageSize ?? 1000,
    },
  });

  return (res.data?.data ?? []) as ContainerApi[];
}


export async function fetchAvailableContainers(containerTypeId?: number): Promise<ContainerApi[]> {
  if (containerTypeId != null) {
    try {
      const byNum = await fetchContainers({ containerTypeId, status: "Available", pageNumber: 1, pageSize: 1000 });
      return (Array.isArray(byNum) ? byNum.filter((c) => String(c.status ?? "").toLowerCase() === "available") : []);
    } catch {
      // ignore and fallback to fetch all + filter by type
    }
  }

  const all = await fetchContainers({ status: "Available", pageNumber: 1, pageSize: 1000 });
  const available = Array.isArray(all) ? all.filter((c) => String(c.status ?? "").toLowerCase() === "available") : [];

  if (containerTypeId != null) {
    const invMap: Record<number, string> = { 1: "A", 2: "B", 3: "C", 4: "D", 5: "A_STORAGE", 6: "B_STORAGE", 7: "C_STORAGE", 8: "D_STORAGE" };
    const want = invMap[Number(containerTypeId)];
    if (want) return available.filter((c) => String(c.type ?? "").toUpperCase() === want);
  }

  return available;
}


export async function pickContainerForOrder(containerTypeIdOrUndefined?: number): Promise<ContainerApi | null> {
  const list = await fetchAvailableContainers(containerTypeIdOrUndefined);
  if (!Array.isArray(list) || list.length === 0) return null;
  return list[0];
}


export async function pickContainerForOrderByType(type?: string | number | null): Promise<ContainerApi | null> {
  if (type == null) return null;
  const label = String(type).trim().toUpperCase();

  const numeric = letterToContainerTypeId(type);
  if (numeric != null) {
    const list = await fetchAvailableContainers(numeric);
    const found = (list ?? []).find((c) => String(c.type ?? "").toUpperCase() === label && String(c.status ?? "").toLowerCase() === "available");
    if (found) return found;
  }

  const all = await fetchAvailableContainers(undefined);
  const found = (all ?? []).find((c) => String(c.type ?? "").toUpperCase() === label && String(c.status ?? "").toLowerCase() === "available");
  if (found) return found;

  return null;
}
