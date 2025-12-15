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
  image?: string[]; 
};

export type Contact = {
  contactId: number;
  customerCode: string;
  customerName?: string;
  employeeCode?: string | null;
  employeeName?: string | null;
  orderCode?: string | null;
  name?: string;
  phoneContact?: string;
  email?: string;
  message: string;
  isActive: boolean;
  image: string[];
};

export type ContactResponse = {
  id?: string | number;
  createdAt?: string;
};

export type ContactListResponse = {
  data: Contact[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};


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

export async function fetchContacts(
  token?: string
): Promise<Contact[]> {
  const url = `${BASE}/api/Contacts`;

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await axios.get(url, { headers });
  return res.data?.data ?? [];
}


export async function fetchContactsByCustomer(
  customerCode: string,
  pageNumber = 1,
  pageSize = 10,
  token?: string
): Promise<ContactListResponse> {
  const url = `${BASE}/api/Contacts`;

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await axios.get(url, {
    headers,
    params: {
      customerCode,
      pageNumber,
      pageSize,
    },
  });

  return res.data;
}
