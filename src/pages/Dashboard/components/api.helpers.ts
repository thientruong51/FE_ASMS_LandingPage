import { fetchOrdersByCustomer, fetchOrderDetails } from "../../../api/order.list";
import { deriveStatus, normalizeStyle } from "./status";
import type { Order } from "../types";

const toNumber = (v: any, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const parseQty = (d: any) => {
  if (d.containerQuantity != null) return toNumber(d.containerQuantity, 1);
  if (d.quantity != null) return toNumber(d.quantity, 1);
  return 1;
};

export const mapOrder = async (summary: any): Promise<Order> => {
  let details: any[] = [];
  try {
    details = await fetchOrderDetails(summary.orderCode);
  } catch {
    details = [];
  }

  const items = (details ?? []).map((d: any) => {
    const qty = parseQty(d);
    return {
      id: String(d.orderDetailId ?? summary.orderCode ?? summary.id ?? ""),
      name: d.containerCode ?? `Item ${d.orderDetailId ?? ""}`,
      price: toNumber(d.price, 0),
      qty,
      img: d.image ?? undefined,
      raw: d,
      productTypeNames: d.productTypeNames ?? [],
      serviceNames: d.serviceNames ?? [],
      isPlaced: d.isPlaced ?? false,
    };
  });

  const kind = normalizeStyle(summary.style);
  const displayStatus = deriveStatus(summary.status, summary.style, summary.returnDate);

  const mapped: Order = {
    id: summary.orderCode ?? String(summary.id ?? ""),
    orderCode: summary.orderCode ?? String(summary.id ?? ""),
    startDate: summary.depositDate ?? summary.orderDate ?? null,
    endDate: summary.returnDate ?? null,
    status: summary.status,
    paymentStatus:
    summary.paymentStatus ??
    summary.payment?.paymentStatus,
    displayStatus,
    kind,
    staff: undefined,
    tracking: [],
    items,
    rawSummary: summary,
    rawDetails: details,
    totalPrice: summary.totalPrice ?? null,
    unpaidAmount: summary.unpaidAmount ?? null,
    boxes: items.reduce((acc: number, it: any) => acc + (it.qty || 0), 0),
  } as Order;

  return mapped;
};

export const fetchOrdersWithDetails = async (page = 1, pageSize = 10) => {
  const res = await fetchOrdersByCustomer(page, pageSize);
  const summaries = res.data ?? [];

  const BATCH = 6;
  const results: Order[] = [];

  for (let i = 0; i < summaries.length; i += BATCH) {
    const batch = summaries.slice(i, i + BATCH);
    const mapped = await Promise.all(batch.map((s: any) => mapOrder(s)));
    results.push(...mapped);
  }

  return results;
};

export const fetchOrderWithDetails = async (orderCode: string) => {
  const res = await fetchOrdersByCustomer(1, 50);
  const found = (res.data ?? []).find((o) => o.orderCode === orderCode);
  if (!found) throw new Error("Order not found");

  return await mapOrder(found);
};
