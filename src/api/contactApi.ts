import axios from "axios";


const BASE = import.meta.env.VITE_API_BASE_URL as string;
if (!BASE) {
  throw new Error("VITE_API_BASE_URL not defined");
}


export type ContactPayload = {
  customerCode: string;

  employeeCode?: string;
  orderCode?: string;

  name?: string;
  phoneContact?: string;
  email?: string;

  message: string;

  isActive?: boolean;
  image?: string[];

  contactDate?: string;   
  retrievedDate?: string; 
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

  contactDate?: string;
  retrievedDate?: string;

  createdAt?: string;
};


export type ContactResponse = {
  id?: number | string;
  createdAt?: string;
};


export type ContactListResponse = {
  data: Contact[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};


const authHeaders = (token?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

const todayISO = () => new Date().toISOString().slice(0, 10);


export async function createContact(
  payload: ContactPayload,
  token?: string
): Promise<ContactResponse> {
  const url = `${BASE}/api/Contacts`;

  const finalPayload: ContactPayload = {
    isActive: true,
    contactDate: todayISO(),
    image: [],
    ...payload,
  };

  const res = await axios.post(url, finalPayload, {
    headers: authHeaders(token),
  });

  return res.data;
}


export async function fetchContacts(
  token?: string
): Promise<Contact[]> {
  const url = `${BASE}/api/Contacts`;

  const res = await axios.get(url, {
    headers: authHeaders(token),
  });

  return res.data?.data ?? [];
}


export async function fetchContactsByCustomer(
  customerCode: string,
  pageNumber = 1,
  pageSize = 10,
  token?: string
): Promise<ContactListResponse> {
  const url = `${BASE}/api/Contacts`;

  const res = await axios.get(url, {
    headers: authHeaders(token),
    params: {
      customerCode,
      pageNumber,
      pageSize,
    },
  });

  return res.data;
}


export async function fetchContactById(
  contactId: number,
  token?: string
): Promise<Contact> {
  const url = `${BASE}/api/Contacts/${contactId}`;

  const res = await axios.get(url, {
    headers: authHeaders(token),
  });

  return res.data;
}


export async function updateContact(
  contactId: number,
  payload: Partial<ContactPayload>,
  token?: string
): Promise<void> {
  const url = `${BASE}/api/Contacts/${contactId}`;

  await axios.put(url, payload, {
    headers: authHeaders(token),
  });
}


export async function deactivateContact(
  contactId: number,
  token?: string
): Promise<void> {
  const url = `${BASE}/api/Contacts/${contactId}`;

  await axios.patch(
    url,
    { isActive: false },
    { headers: authHeaders(token) }
  );
}
