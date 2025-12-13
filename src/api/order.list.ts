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

  (config.headers as AxiosRequestHeaders)[
    "Authorization"
  ] = `Bearer ${token}`;

  return config;
});

const getCustomerCodeFromToken = (): string | null => {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const base64Url = token.split(".")[1] ?? "";
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    const padded = pad ? base64 + "=".repeat(4 - pad) : base64;

    const jsonPayload = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );

    const payload = JSON.parse(jsonPayload);
    return payload?.CustomerCode ?? payload?.customerCode ?? null;
  } catch (err) {
    console.error("Failed to parse token payload", err);
    return null;
  }
};



export type OrderSummary = {
  orderCode: string;
  customerCode: string;

  orderDate: string | null;
  depositDate: string | null;
  returnDate: string | null;

  status: string;
  paymentStatus: string;

  totalPrice: number;
  unpaidAmount: number;

  style?: "full" | "self" | null;

  customerName?: string | null;
  phoneContact?: string | null;
  email?: string | null;
  note?: string | null;
  address?: string | null;
  passkey?: number | null;
  refund?: number | null;
  imageUrls?: string[];

  styleTag?: string | null;
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

  productTypeNames?: string[];
  serviceNames?: string[];
  isPlaced?: boolean;
};



const normalizeOrderSummary = (o: any): OrderSummary => ({
  orderCode: o.orderCode,
  customerCode: o.customerCode,

  orderDate: o.orderDate ?? null,
  depositDate: o.depositDate ?? null,
  returnDate: o.returnDate ?? null,

  status: o.status ?? "",
  paymentStatus: o.paymentStatus ?? "",

  totalPrice: Number(o.totalPrice ?? 0),
  unpaidAmount: Number(o.unpaidAmount ?? 0),

  style: o.style ?? null,

  customerName: o.customerName ?? null,
  phoneContact: o.phoneContact ?? null,
  email: o.email ?? null,
  note: o.note ?? null,
  address: o.address ?? null,
  passkey: o.passkey ?? null,
  refund: o.refund ?? null,
  imageUrls: Array.isArray(o.imageUrls) ? o.imageUrls : [],

  styleTag: o.style ?? null,
});



export const fetchOrdersByCustomer = async (
  pageNumber = 1,
  pageSize = 10
): Promise<PagedResult<OrderSummary>> => {
  const customerCode = getCustomerCodeFromToken();
  if (!customerCode) {
    throw new Error("customerCode not found in accessToken");
  }

  const res = await api.get("/api/Order", {
    params: {
      pageNumber,
      pageSize,
      customerCode,
    },
  });

  const payload = res.data ?? {};

  return {
    page: payload.page ?? 1,
    pageSize: payload.pageSize ?? pageSize,
    totalCount: payload.totalCount ?? 0,
    totalPages: payload.totalPages ?? 1,
    data: Array.isArray(payload.data)
      ? payload.data.map(normalizeOrderSummary)
      : [],
  };
};

export const fetchOrderByCode = async (
  orderCode: string
): Promise<OrderSummary | null> => {
  if (!orderCode) throw new Error("orderCode is required");

  const res = await api.get(`/api/Order/${encodeURIComponent(orderCode)}`);
  const payload = res.data?.data ?? res.data;

  if (!payload) return null;
  return normalizeOrderSummary(payload);
};

export const fetchOrderDetails = async (
  orderCode: string
): Promise<OrderDetailApi[]> => {
  if (!orderCode) throw new Error("orderCode is required");

  const res = await api.get(
    `/api/Order/${encodeURIComponent(orderCode)}/details`
  );

  const payload = res.data ?? {};
  const detailsRaw = Array.isArray(payload.data)
    ? payload.data
    : Array.isArray(payload)
    ? payload
    : [];

  return detailsRaw.map((d: any) => ({
    orderDetailId: d.orderDetailId,
    storageCode: d.storageCode ?? null,
    containerCode: d.containerCode ?? null,
    floorCode: d.floorCode ?? null,
    floorNumber: d.floorNumber ?? null,
    price: Number(d.price ?? 0),
    quantity: d.quantity ?? "0",
    subTotal: d.subTotal ?? d.subtotal ?? 0,
    image: d.image ?? null,
    containerType: d.containerType ?? null,
    containerQuantity: d.containerQuantity ?? null,
    storageTypeId: d.storageTypeId ?? null,
    shelfTypeId: d.shelfTypeId ?? null,
    shelfQuantity: d.shelfQuantity ?? null,
    productTypeIds: Array.isArray(d.productTypeIds)
      ? d.productTypeIds
      : null,
    serviceIds: Array.isArray(d.serviceIds) ? d.serviceIds : null,
    productTypeNames: Array.isArray(d.productTypeNames)
      ? d.productTypeNames
      : Array.isArray(d.productTypes)
      ? d.productTypes
      : [],
    serviceNames: Array.isArray(d.serviceNames)
      ? d.serviceNames
      : Array.isArray(d.services)
      ? d.services
      : [],
    isPlaced: d.isPlaced ?? d.is_placed ?? false,
  }));
};

export const updateOrderPasskey = async (payload: {
  orderCode: string;
  oldPassKey: number;
  newPassKey: number;
}) => {
  const res = await api.put(
    "/api/OrderStatus/update-passkey",
    payload
  );
  return res.data;
};

export const cancelOrder = async (payload: {
  orderCode: string;
  cancelReason: string;
}) => {
  const res = await api.post(
    "/api/OrderStatus/cancel",
    payload
  );
  return res.data;
};
