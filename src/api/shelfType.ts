import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE_URL as string;

export type ShelfTypeApi = {
  shelfTypeId: number;
  name: string;
  length: number; 
  width: number;
  height: number;
  price: number;
  imageUrl: string | null;
};

export async function fetchShelfTypes(pageNumber = 1, pageSize = 50): Promise<ShelfTypeApi[]> {
  if (!BASE) throw new Error("VITE_API_BASE_URL not defined");
  const url = `${BASE}/api/ShelfType?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  const res = await axios.get(url);
  return res.data?.data ?? [];
}
