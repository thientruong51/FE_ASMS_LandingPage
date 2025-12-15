import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE_URL as string;



export interface TrackingHistoryItem {
  trackingHistoryId: number;
  orderDetailCode?: string | null;
  oldStatus?: string | null;
  newStatus?: string | null;
  actionType?: string | null;
  createAt?: string | null;
  currentAssign?: string | null;
  nextAssign?: string | null;

  image?: string | null;
  images?: string[] | null;

  orderCode?: string | null;
}

export interface TrackingHistoryListResponse {
  data: TrackingHistoryItem[];
  currentStatus?: string | null;

  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
}

export interface TrackingHistoryPayload {
  orderDetailCode?: string | null;
  orderCode?: string | null;
  oldStatus?: string | null;
  newStatus?: string | null;
  actionType?: string | null;
  createAt?: string | null;
  currentAssign?: string | null;
  nextAssign?: string | null;

  image?: string | null;
  images?: string[] | null;
}

export interface UpdateTrackingImagePayload {
  orderCode: string;
  image: string[];
}


export async function getTrackingHistories(
  params?: Record<string, any>
): Promise<TrackingHistoryListResponse> {
  const url = `${BASE}/api/TrackingHistory`;
  const res = await axios.get(url, { params });
  return res.data
}


export async function getTrackingByOrder(
  orderCode: string
): Promise<TrackingHistoryListResponse> {
  const url = `${BASE}/api/TrackingHistory/order/${encodeURIComponent(
    orderCode
  )}`;
  const res = await axios.get(url);
    return res.data
}


export async function createTrackingHistory(
  payload: TrackingHistoryPayload
): Promise<TrackingHistoryItem> {
  const url = `${BASE}/api/TrackingHistory`;
  const res = await axios.post(url, payload);
  return res.data?.data ?? res.data;
}


export async function updateTrackingStatus(
  payload: TrackingHistoryPayload
): Promise<TrackingHistoryItem> {
  const url = `${BASE}/api/TrackingHistory/update-status`;
  const res = await axios.post(url, payload);
  return res.data?.data ?? res.data;
}

export async function updateTrackingHistory(
  id: number,
  payload: TrackingHistoryPayload
): Promise<TrackingHistoryItem> {
  const url = `${BASE}/api/TrackingHistory/${id}`;
  const res = await axios.put(url, payload);
  return res.data?.data ?? res.data;
}


export async function deleteTrackingHistory(id: number): Promise<void> {
  const url = `${BASE}/api/TrackingHistory/${id}`;
  await axios.delete(url);
}


export async function updateTrackingImage(
  orderCode: string,
  images: string[]
): Promise<TrackingHistoryItem> {
  const payload: UpdateTrackingImagePayload = {
    orderCode,
    image: images,
  };

  const url = `${BASE}/api/OrderStatus/tracking/update-image`;
  const res = await axios.put(url, payload);
  return res.data?.data ?? res.data;
}
