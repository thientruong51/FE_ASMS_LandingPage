import axios from "axios";

export type StorageTypeApi = {
  storageTypeId: number;
  name: string;
  length: number;
  width: number;
  height: number;
  totalVolume: number;
  area: number;
  price: number | null;
  imageUrl: string | null;
};

const BASE = (import.meta.env.VITE_API_BASE_URL ?? "") as string;

export const fetchStorageTypes = async (): Promise<StorageTypeApi[]> => {
  if (!BASE) throw new Error("VITE_API_BASE_URL is not defined");
  const res = await axios.get(`${BASE}/api/StorageType`);
  return res.data?.data ?? [];
};
