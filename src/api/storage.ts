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
  pageSize = 1000
): Promise<StorageApi[]> {
  const url = `${BASE}/api/Storage?pageNumber=${pageNumber}&pageSize=${pageSize}&buildingCode=${encodeURIComponent(
    buildingCode
  )}`;

  const res = await axios.get(url);
  return res.data?.data ?? [];
}
