import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE_URL as string;

export type ProductTypeApi = {
  id(id: any): unknown;
  productTypeId: number;
  name: string;
  status?: string;
  isActive?: boolean;
  isFragile?: boolean;
  canStack?: boolean;
  description?: string | null;
};

export async function fetchProductTypes(): Promise<ProductTypeApi[]> {
  if (!BASE) throw new Error("VITE_API_BASE_URL not defined");
  const url = `${BASE}/api/ProductType`;
  const res = await axios.get(url);
  const payload = res.data ?? res;
  if (Array.isArray(payload)) return payload as ProductTypeApi[];
  if (payload && Array.isArray(payload.data)) return payload.data as ProductTypeApi[];
  return [];
}
