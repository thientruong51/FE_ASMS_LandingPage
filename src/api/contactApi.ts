import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE_URL as string;
if (!BASE) throw new Error("VITE_API_BASE_URL not defined");

export type ContactPayload = {
  customerCode: string;
  employeeCode?: string; 
  orderCode?: string;
  name?: string;
  phoneContact?: string;
  email?: string;
  message: string;
};

export type ContactResponse = {
  id?: string | number;
  createdAt?: string;
};

/**
 * Gửi liên hệ đến backend.
 * @param payload - dữ liệu contact theo API của backend
 * @param token - optional Bearer token (nếu cần auth)
 * @returns dữ liệu trả về từ server
 */
export async function createContact(
  payload: ContactPayload,
  token?: string
): Promise<ContactResponse> {
  const url = `${BASE}/api/Contacts`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await axios.post(url, payload, { headers });
  return res.data;
}


export async function fetchContacts(token?: string): Promise<ContactResponse[]> {
  const url = `${BASE}/api/Contacts`;
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await axios.get(url, { headers });
  return res.data ?? [];
}
