import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE_URL as string;



export interface CreateShortLinkRequest {
  originalUrl: string;
  orderCode?: string;
  orderDetailId?: number;
}

export interface ShortLinkApi {
  shortUrl: string;
  shortCode: string;
  originalUrl: string;
  createdAt: string;
  expiresAt?: string | null;
}


export async function createShortLink(
  payload: CreateShortLinkRequest
): Promise<ShortLinkApi> {
  const url = `${BASE}/api/ShortLink/create`;
  const res = await axios.post(url, payload);
  return res.data?.data ?? res.data;
}


export async function getShortLinkByOrderCode(
  orderCode: string
): Promise<ShortLinkApi | null> {
  const url = `${BASE}/api/ShortLink/order/${encodeURIComponent(orderCode)}`;
  const res = await axios.get(url);
  return res.data;
}


export async function getShortLinkByOrderDetailId(
  orderDetailId: number
): Promise<ShortLinkApi | null> {
  const url = `${BASE}/api/ShortLink/order-detail/${orderDetailId}`;
  const res = await axios.get(url);
 return res.data;
}
