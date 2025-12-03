import axios, {
  type InternalAxiosRequestConfig,
  type AxiosRequestHeaders,
} from "axios";

const BASE = (import.meta.env.VITE_API_BASE_URL ?? "") as string;
if (!BASE) throw new Error("VITE_API_BASE_URL is not defined");

const api = axios.create({
  baseURL: BASE,
});

const getAccessToken = (): string | null => {
  return localStorage.getItem("accessToken");
};


api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (!token) return config;

  if (!config.headers) {
    config.headers = {} as AxiosRequestHeaders;
  }

  (config.headers as AxiosRequestHeaders)["Authorization"] = `Bearer ${token}`;

  return config;
});

const getCustomerCodeFromToken = (): string | null => {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const base64Url = token.split(".")[1] ?? "";
    // convert base64url -> base64
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    // pad with '=' to correct length
    const pad = base64.length % 4;
    const padded = pad ? base64 + "=".repeat(4 - pad) : base64;

    // atob then handle UTF-8 properly
    const jsonPayload = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => {
          const hex = c.charCodeAt(0).toString(16).padStart(2, "0");
          return "%" + hex;
        })
        .join("")
    );

    const payload = JSON.parse(jsonPayload);

    // try both casing just in case
    return payload?.CustomerCode ?? payload?.customerCode ?? null;
  } catch (err) {
    console.error("Failed to parse token payload", err);
    return null;
  }
};



export type OrderSummary = {
  orderCode: string;
  customerCode: string;
  orderDate: string;
  depositDate: string;
  returnDate: string | null;
  status: string;
  paymentStatus: string;
  totalPrice: number;
  unpaidAmount: number;
  style?: string | null;
};

export type PagedResult<T> = {
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type OrderDetailApi = {
  orderDetailId: number;
  storageCode: string | null;
  containerCode: string | null;
  floorCode: string | null;
  floorNumber: number | null;
  price: number;
  quantity: string | number;
  subTotal: number;
  image: string | null;
  containerType: number | null;
  containerQuantity: number | null;
  storageTypeId: number | null;
  shelfTypeId: number | null;
  shelfQuantity: number | null;
  productTypeIds: number[] | null;
  serviceIds: number[] | null;
};

export const fetchOrdersByCustomer = async (
  pageNumber = 1,
  pageSize = 10
): Promise<PagedResult<OrderSummary>> => {
  const customerCode = getCustomerCodeFromToken();
  if (!customerCode) throw new Error("customerCode not found in accessToken");

  const res = await api.get("/api/Order", {
    params: {
      pageNumber,
      pageSize,
      customerCode,
    },
  });

  return res.data as PagedResult<OrderSummary>;
};

export const fetchOrderByCode = async (orderCode: string): Promise<any> => {
  if (!orderCode) throw new Error("orderCode is required");
  const res = await api.get(`/api/Order/${encodeURIComponent(orderCode)}`);
  const payload = res.data ?? null;
  if (!payload) return null;
  if (payload.data && typeof payload.data === "object") return payload.data;
  return payload;
};

export const fetchOrderDetails = async (orderCode: string): Promise<OrderDetailApi[]> => {
  if (!orderCode) throw new Error("orderCode is required");

  const res = await api.get(`/api/Order/${encodeURIComponent(orderCode)}/details`);

  const payload = res.data ?? {};
  // payload may be { success, data: [...] } or directly array
  const detailsRaw = Array.isArray(payload.data) ? payload.data : Array.isArray(payload) ? payload : [];

  return detailsRaw.map((d: any) => ({
    orderDetailId: d.orderDetailId,
    storageCode: d.storageCode ?? null,
    containerCode: d.containerCode ?? null,
    floorCode: d.floorCode ?? null,
    floorNumber: d.floorNumber ?? null,
    price: d.price ?? 0,
    quantity: d.quantity ?? "0",
    subTotal: d.subTotal ?? d.subtotal ?? 0,
    image: d.image ?? null,
    containerType: d.containerType ?? null,
    containerQuantity: d.containerQuantity ?? null,
    storageTypeId: d.storageTypeId ?? null,
    shelfTypeId: d.shelfTypeId ?? null,
    shelfQuantity: d.shelfQuantity ?? null,
    // keep ids if present
    productTypeIds: Array.isArray(d.productTypeIds) ? d.productTypeIds : null,
    serviceIds: Array.isArray(d.serviceIds) ? d.serviceIds : null,
    // IMPORTANT: include names if backend returns them
    productTypeNames: Array.isArray(d.productTypeNames) ? d.productTypeNames : Array.isArray(d.productTypes) ? d.productTypes : [],
    serviceNames: Array.isArray(d.serviceNames) ? d.serviceNames : Array.isArray(d.services) ? d.services : [],
    // some backends return 'isPlaced' or 'is_placed'
    isPlaced: d.isPlaced ?? d.is_placed ?? false,
  }));
};

