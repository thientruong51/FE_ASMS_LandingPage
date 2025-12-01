import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE_URL as string;

export type DistanceResponse = {
  origin: string;
  destination: string;
  distanceInKm: number;
  distanceInMeters: number;
  durationInMinutes: number;
  durationInSeconds: number;
  estimatedCost: number;
  status: "SUCCESS" | "FAILED";
};

export type DistanceRequest = {
  origin: string;
  destination: string;
};

export async function calculateDistance(
  payload: DistanceRequest
): Promise<DistanceResponse> {
  if (!BASE) throw new Error("VITE_API_BASE_URL not defined");

  const url = `${BASE}/api/Distance/calculate`;

  const res = await axios.post(url, payload);

  return res.data;
}
