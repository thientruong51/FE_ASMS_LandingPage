import type { OrderSummary, OrderDetailApi } from "../../../api/order.list"; 
import type { Order, Item } from "../types";
import { deriveStatus, normalizeStyle } from "./status";


const toNumber = (v: any, fallback = 0): number => {
  if (v == null) return fallback;
  if (typeof v === "number") return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};


const parseQty = (d: OrderDetailApi | any): number => {
  if (d.containerQuantity != null) return toNumber(d.containerQuantity, 1);
  if (d.quantity != null) return toNumber(d.quantity, 1);
  return 1;
};


export const mapOrderDetailToItem = (d: OrderDetailApi & any): Item => {
  const qty = parseQty(d);

  return {
    id: String(d.orderDetailId ?? d.containerCode ?? Math.random().toString(36).slice(2, 9)),
    name: d.containerCode ?? `Item ${d.orderDetailId ?? ""}`,
    price: toNumber(d.price, 0),
    qty,
    img: d.image ?? null,
    raw: d,
    productTypeNames: Array.isArray((d as any).productTypeNames) ? (d as any).productTypeNames : undefined,
    serviceNames: Array.isArray((d as any).serviceNames) ? (d as any).serviceNames : undefined,
    isPlaced: typeof (d as any).isPlaced === "boolean" ? (d as any).isPlaced : undefined,
  } as Item;
};


export const mapSummaryAndDetailsToOrder = (
  summary: OrderSummary,
  details: OrderDetailApi[] = []
): Order => {
  const items: Item[] = (details ?? []).map((d) => mapOrderDetailToItem(d as any));

  const boxes = items.reduce((acc, it) => acc + (it.qty || 0), 0);

  const kind = normalizeStyle((summary as any).style); 
  const displayStatus = deriveStatus(summary.status ?? null, summary.style ?? null, summary.returnDate ?? null);

  const mapped: Order & any = {
    id: summary.orderCode,
    kind: kind === "self" ? "self" : "managed",
    startDate: summary.depositDate ?? summary.orderDate ?? null,
    endDate: summary.returnDate ?? null,
    status: summary.status ?? "unknown", 
    displayStatus,
    staff: undefined,
    tracking: [],

    items,
    rawSummary: summary,
    rawDetails: details ?? [],
    totalPrice: summary.totalPrice ?? null,
    unpaidAmount: summary.unpaidAmount ?? null,
    boxes: boxes || undefined,
  };

  return mapped as Order;
};

export const mapSummaryToOrder = (summary: OrderSummary): Order => {
  const kind = normalizeStyle((summary as any).style);
  const displayStatus = deriveStatus(summary.status ?? null, summary.style ?? null, summary.returnDate ?? null);

  const mapped: Order & any = {
    id: summary.orderCode,
    kind: kind === "self" ? "self" : "managed",
    startDate: summary.depositDate ?? summary.orderDate ?? null,
    endDate: summary.returnDate ?? null,
    status: summary.status ?? "unknown",
    displayStatus,
    staff: undefined,
    tracking: [],
    items: [],
    rawSummary: summary,
    rawDetails: [],
    totalPrice: summary.totalPrice ?? null,
    unpaidAmount: summary.unpaidAmount ?? null,
  };

  return mapped as Order;
};
