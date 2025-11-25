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
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.customerCode ?? null;
  } catch {
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

export const fetchOrderDetails = async (orderCode: string): Promise<OrderDetailApi[]> => {
  if (!orderCode) throw new Error("orderCode is required");

  const res = await api.get(`/api/Order/${encodeURIComponent(orderCode)}/details`);

  const payload = res.data ?? {};
  const details = Array.isArray(payload.data) ? payload.data : [];

  return details.map((d: any) => ({
    orderDetailId: d.orderDetailId,
    storageCode: d.storageCode ?? null,
    containerCode: d.containerCode ?? null,
    floorCode: d.floorCode ?? null,
    floorNumber: d.floorNumber ?? null,
    price: d.price ?? 0,
    quantity: d.quantity ?? "0",
    subTotal: d.subTotal ?? 0,
    image: d.image ,
    containerType: d.containerType ?? null,
    containerQuantity: d.containerQuantity ?? null,
    storageTypeId: d.storageTypeId ?? null,
    shelfTypeId: d.shelfTypeId ?? null,
    shelfQuantity: d.shelfQuantity ?? null,
    productTypeIds: Array.isArray(d.productTypeIds) ? d.productTypeIds : null,
    serviceIds: Array.isArray(d.serviceIds) ? d.serviceIds : null,
  }));
};
