import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE_URL as string;

export interface StorageApi {
  storageCode: string;
  buildingId: number;
  buildingCode: string;
  storageTypeId: number;
  storageTypeName: string;
  productTypeId: number;
  productTypeName: string;
  length: number;
  width: number;
  height: number;
  status: string; 
  isActive: boolean;
}


export async function fetchStorages(
  buildingCode: string,
  pageNumber = 1,
  pageSize = 1000,
  status?: string
): Promise<StorageApi[]> {
  const url = `${BASE}/api/Storage?pageNumber=${pageNumber}&pageSize=${pageSize}&buildingCode=${encodeURIComponent(
    buildingCode
  )}${status ? `&status=${encodeURIComponent(status)}` : ""}`;

  const res = await axios.get(url);
  return res.data?.data ?? [];
}

export async function fetchReadyStorages(
  buildingCode: string,
  pageNumber = 1,
  pageSize = 1000
): Promise<StorageApi[]> {
  return fetchStorages(buildingCode, pageNumber, pageSize, "Ready");
}


export async function pickStorageForOrder(
  buildingCode: string,
  storageTypeId?: number
): Promise<StorageApi | null> {
  const list = await fetchReadyStorages(buildingCode);

  const filtered =
    storageTypeId != null
      ? list.filter((s) => Number(s.storageTypeId) === Number(storageTypeId))
      : list;

  if (filtered.length === 0) return null;

  return filtered[0]; 
}
