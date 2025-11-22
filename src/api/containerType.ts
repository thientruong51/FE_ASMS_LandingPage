import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE_URL as string;

export type ContainerTypeApi = {
  containerTypeId: number;
  type: string; 
  length: number;
  width: number;
  height: number;
  imageUrl: string | null;
  price: number | null;
};

export async function fetchContainerTypes(): Promise<ContainerTypeApi[]> {
  if (!BASE) throw new Error("VITE_API_BASE_URL not defined");
  const url = `${BASE}/api/ContainerType`;
  const res = await axios.get(url);
  return res.data ?? [];
}
