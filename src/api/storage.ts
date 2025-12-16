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

export async function pickStorageForOrder(
  buildingCode: string,
  storageTypeId?: number
): Promise<StorageApi | null> {
  const list = await fetchStorages(buildingCode, 1, 1000);

  const readyList = list.filter(
    (s) =>
      s &&
      s.status === "Ready" &&
      s.isActive === true
  );

  const filtered =
    storageTypeId != null
      ? readyList.filter(
          (s) => Number(s.storageTypeId) === Number(storageTypeId)
        )
      : readyList;

  if (filtered.length === 0) return null;

  return filtered[0];
}
