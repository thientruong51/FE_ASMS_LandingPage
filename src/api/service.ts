import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE_URL as string;

export type ServiceApi = {
  serviceId: number;
  name: string;
  price: number;
  description: string | null;
};

export async function fetchServices(): Promise<ServiceApi[]> {
  if (!BASE) throw new Error("VITE_API_BASE_URL not defined");

  const url = `${BASE}/api/Service`;

  const res = await axios.get(url);

  const payload = res.data ?? {};
  const list =
    payload.data?.data ??
    payload.data ??
    payload.services ??
    (Array.isArray(payload) ? payload : undefined);

  return list ?? [];
}
