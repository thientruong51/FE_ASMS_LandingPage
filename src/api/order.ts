// orderBuilder.ts
import axios from "axios";
import { pickStorageForOrder } from "./storage";
import { fetchStorageTypes } from "./storageType";
import type { StorageTypeApi } from "./storageType";

const BASE = (import.meta.env.VITE_API_BASE_URL ?? "") as string;
if (!BASE) throw new Error("VITE_API_BASE_URL not defined");

// -------------------- Types --------------------
export type OrderDetailPayload = {
  storageCode?: string | null;
  containerCode?: string | null;
  price: number;
  quantity: string;
  image?: string | null;
  containerType?: number | null;
  containerQuantity?: number | null;
  productTypeIds?: number[] | null;
  serviceIds?: number[] | null;
  storageTypeId?: number | null;
  shelfTypeId?: number | null;
  shelfQuantity?: number | null;
};

export type OrderWithDetailsPayload = {
  customerCode?: string | null;
  depositDate?: string | null;
  returnDate?: string | null;
  status?: string;
  paymentStatus?: string;

  storageTypeId?: number | null;
  shelfTypeId?: number | null;
  shelfQuantity?: number | null;

  customerName?: string | null;
  phoneContact?: string | null;
  email?: string | null;
  note?: string | null;
  address?: string | null;
  image?: string | null;
  style?: "self" | "full" | null;
  orderDetails: OrderDetailPayload[];

  // ADDED: totals for backend
  totalPrice?: number;
  unpaidAmount?: number;
  pricing?: any; // optional copy of booking pricing for traceability
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

// -------------------- Helpers --------------------
function toNumberSafe(v: any): number | undefined {
  if (v == null) return undefined;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function ensureNumberArray(v: any): number[] {
  if (!v) return [];
  if (Array.isArray(v)) {
    return v
      .map((x) => {
        if (typeof x === "number") return x;
        if (typeof x === "string") {
          const n = Number(x);
          return Number.isFinite(n) ? n : null;
        }
        if (typeof x === "object" && x) {
          const id = x.productTypeId ?? x.id ?? x.typeId ?? x?.productTypeId;
          const n = Number(id);
          return Number.isFinite(n) ? n : null;
        }
        return null;
      })
      .filter((x) => x != null) as number[];
  }
  const n = Number(v);
  return Number.isFinite(n) ? [n] : [];
}

function mapRoomToStorageTypeId(room: any): number | undefined {
  if (!room) return undefined;
  if (room.storageTypeId != null) {
    const n = Number(room.storageTypeId);
    if (Number.isFinite(n)) return n;
  }
  const id = Number(room.id);
  if (!Number.isFinite(id)) return undefined;
  const map: Record<number, number> = {
    1: 1,
    2: 2,
    3: 3,
    6: 6,
    7: 7,
    8: 8,
  };
  return map[id] ?? undefined;
}

function mapContainerTypeToId(type: any): number | null {
  if (type == null) return null;
  const s = String(type).toUpperCase().trim();
  const map: Record<string, number> = {
    A: 1,
    B: 2,
    C: 3,
    D: 4,
    "A_STORAGE": 5,
    "B_STORAGE": 6,
    "C_STORAGE": 7,
    "D_STORAGE": 8,
  };
  if (map[s]) return map[s];
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

// -------------------- API helpers --------------------
export async function createOrderWithDetails(payload: OrderWithDetailsPayload) {
  const url = `${BASE}/api/Order/with-details`;
  const res = await axios.post<ApiResponse<any>>(url, payload);
  return res.data;
}

// -------------------- buildOrderPayloadFromBooking --------------------
export async function buildOrderPayloadFromBooking(
  bookingData: any,
  options?: {
    mode?: "self" | "full";
    buildingHasAC?: boolean;
    buildingCodeOverride?: string;
    chosenContainerType?: string | number | null;
    chosenStorageTypeId?: number | string | null;
  },
  extras?: {
    paymentMethod?: string;
    status?: string;
    paymentStatus?: string;
  }
): Promise<OrderWithDetailsPayload> {
  if (!bookingData) throw new Error("Missing booking data");

  const mode: "self" | "full" | undefined =
    options?.mode ?? (bookingData.style === "self" ? "self" : bookingData.style === "full" ? "full" : undefined);

  const orderDetails: OrderDetailPayload[] = [];

  const globalProductTypeIds = ensureNumberArray(
    bookingData.productTypeIds ?? bookingData.selectedProductTypeIds ?? bookingData.productTypes ?? []
  );
  const globalServiceIds = ensureNumberArray(bookingData.services ?? bookingData.serviceIds ?? []);

  const countsPricing = bookingData?.counts?.pricingInfo ?? null;
  const pricingObj = bookingData?.pricing ?? null;

  const perShelfPrice =
    toNumberSafe(countsPricing?.perShelfPrice) ??
    toNumberSafe(pricingObj?.perShelfPrice) ??
    toNumberSafe(countsPricing?.shelfPrice) ??
    toNumberSafe(pricingObj?.shelfPrice) ??
    0;

  const perBoxDefault = toNumberSafe(countsPricing?.perBoxPrice) ?? toNumberSafe(pricingObj?.perBoxPrice) ?? 0;

  const boxPricesMap =
    (countsPricing?.boxPricesMap && typeof countsPricing.boxPricesMap === "object")
      ? countsPricing.boxPricesMap
      : pricingObj?.boxPricesMap ?? {};

  // -------------------- MODE: SELF --------------------
  if (mode === "self") {
    const hasAC = typeof options?.buildingHasAC === "boolean" ? options.buildingHasAC : Boolean(bookingData?.room?.hasAC);
    const buildingCode = options?.buildingCodeOverride ?? (hasAC ? "BLD003" : "BLD002");

    const chosenStorageTypeId =
      toNumberSafe(options?.chosenStorageTypeId) ??
      toNumberSafe(bookingData?.storageTypeId) ??
      mapRoomToStorageTypeId(bookingData?.room) ??
      undefined;

    // pickStorageForOrder may still be used to select a storage (kept here intentionally)
    const pickedStorage = await pickStorageForOrder(buildingCode, chosenStorageTypeId as any);

    if (!pickedStorage) {
      if (chosenStorageTypeId != null) {
        throw new Error(
          `Không tìm thấy kho trạng thái Ready cho storageTypeId=${chosenStorageTypeId} tại building ${buildingCode}`
        );
      } else {
        throw new Error(`Không tìm thấy kho trạng thái Ready tại building ${buildingCode}`);
      }
    }

    // attempt to get a storage price if storage types available
    let storagePrice = 0;
    try {
      const storageTypeIdToLookup =
        toNumberSafe(chosenStorageTypeId) ?? toNumberSafe(pickedStorage?.storageTypeId) ?? undefined;
      if (storageTypeIdToLookup != null) {
        const storageTypes: StorageTypeApi[] = await fetchStorageTypes();
        const found = storageTypes.find((s) => Number(s.storageTypeId) === Number(storageTypeIdToLookup));
        const foundPrice = toNumberSafe(found?.price);
        if (foundPrice != null) storagePrice = Number(foundPrice);
      }
    } catch (err) {
      // ignore; storagePrice stays 0
    }

    // determine counts / byType
    const byType: Record<string, number> =
      bookingData?.counts?.byType && typeof bookingData.counts.byType === "object" ? bookingData.counts.byType : {};

    if ((!byType || Object.keys(byType).length === 0) && Array.isArray(bookingData?.customItems)) {
      for (const it of bookingData.customItems) {
        const k = String(it?.type ?? it?.label ?? it?.name ?? "").toUpperCase();
        byType[k] = (byType[k] ?? 0) + 1;
      }
    }

    const shelfQuantity =
      toNumberSafe(bookingData?.shelfQuantity) ??
      toNumberSafe(bookingData?.counts?.shelves) ??
      (byType["SHELF"] ?? byType["shelf"] ?? byType["Shelf"] ?? 0);

    // ROOM / STORAGE line — containerCode always null
    orderDetails.push({
      storageCode: pickedStorage.storageCode ?? null,
      containerCode: null, // always null per requirement
      price: Number(storagePrice),
      quantity: "1",
      image: bookingData?.room?.image ?? null,
      containerType: null,
      containerQuantity: null,
      productTypeIds: globalProductTypeIds.length > 0 ? globalProductTypeIds : null,
      serviceIds: globalServiceIds.length > 0 ? globalServiceIds : null,
      storageTypeId: chosenStorageTypeId ?? null,
      shelfTypeId: null,
      shelfQuantity: null,
    });

    // shelf lines (if any) — containerCode null
    const shelfTypeId = 1;
    if (shelfQuantity && shelfQuantity > 0) {
      const shelfTotalPrice = Number((perShelfPrice ?? 0) * shelfQuantity);
      orderDetails.push({
        storageCode: null,
        containerCode: null, // always null
        price: Number(shelfTotalPrice),
        quantity: String(shelfQuantity),
        image: null,
        containerType: null,
        containerQuantity: null,
        productTypeIds: null,
        serviceIds: null,
        shelfTypeId,
        shelfQuantity: Number(shelfQuantity),
      });
    }

    // box-like types inferred from byType — each entry becomes an orderDetail with containerCode null
    const boxTypesEntries = Object.entries(byType).filter(([k]) => {
      if (!k) return false;
      if (/^[ABCD]$/i.test(k)) return true;
      if (/box|container|crate/i.test(k)) return true;
      return false;
    });

    for (const [typeKeyRaw, cnt] of boxTypesEntries) {
      const typeKey = String(typeKeyRaw).toUpperCase();
      const unitPrice = toNumberSafe(boxPricesMap?.[typeKey]) ?? perBoxDefault ?? 0;
      const numericType = mapContainerTypeToId(typeKey);
      // Here we record total price for that line, and quantity = cnt
      orderDetails.push({
        storageCode: null,
        containerCode: null, // always null
        price: Number((unitPrice ?? 0) * Number(cnt ?? 0)),
        quantity: String(cnt ?? 0),
        image: null,
        containerType: numericType,
        containerQuantity: Number(cnt ?? 0),
        productTypeIds: null,
        serviceIds: null,
        shelfTypeId: null,
        shelfQuantity: null,
      });
    }
  }

  // -------------------- MODE: FULL --------------------
  else if (mode === "full") {
    const boxesArr = Array.isArray(bookingData?.boxes)
      ? bookingData.boxes
      : Array.isArray(bookingData?.boxPayload?.boxes)
      ? bookingData.boxPayload.boxes
      : [];

    if ((!boxesArr || boxesArr.length === 0) && bookingData?.box) {
      boxesArr.push(bookingData.box);
    }

    // For FULL mode we DO NOT pick containers — create orderDetails with containerCode = null
    for (const b of boxesArr) {
      const label = b.label ?? b.type ?? b.id ?? b.name ?? "";
      const quantity = Number(b.quantity ?? b.qty ?? 1) || 1;
      const unitFromBox =
        toNumberSafe(b.price ?? b.unitPrice) ??
        toNumberSafe(boxPricesMap?.[String(label).toUpperCase()]) ??
        perBoxDefault ??
        0;

      // Current behaviour: push one orderDetail per box instance with price = unit price and quantity="1".
      // We'll keep that (backend summation will work), but our total computation later will multiply price * quantity.
      for (let i = 0; i < quantity; i++) {
        orderDetails.push({
          storageCode: null,
          containerCode: null, // always null
          price: Number(unitFromBox),
          quantity: "1",
          image: b.imageUrl ?? b.image ?? null,
          containerType: mapContainerTypeToId(label),
          containerQuantity: null,
          productTypeIds: ensureNumberArray(b.productTypeIds ?? b.productTypes ?? globalProductTypeIds),
          serviceIds: ensureNumberArray(bookingData.services ?? bookingData.serviceIds ?? globalServiceIds),
          storageTypeId: null,
          shelfTypeId: null,
          shelfQuantity: null,
        });
      }
    }
  } else {
    throw new Error("Không xác định được mode (self/full) từ bookingData hoặc options.");
  }

  // -------------------- Compute totals (totalPrice / unpaidAmount) --------------------
  // Prefer bookingData.pricing.* if provided, otherwise sum orderDetails (price * quantity)
  let computedTotal = 0;
  const bPricing = bookingData?.pricing ?? null;

  if (bPricing) {
    const candidate =
      toNumberSafe(bPricing.total) ??
      toNumberSafe(bPricing.subtotal) ??
      toNumberSafe(bPricing.totalPrice) ??
      toNumberSafe(bPricing.amount) ??
      toNumberSafe(bPricing.subTotal); // different possible keys
    if (candidate != null && !Number.isNaN(Number(candidate)) && Number(candidate) >= 0) {
      computedTotal = Number(candidate);
    }
  }

  if (!computedTotal || computedTotal === 0) {
    computedTotal = orderDetails.reduce((sum, d) => {
      const priceNum = toNumberSafe(d.price) ?? 0;
      const qtyRaw = d.quantity;
      const qtyNum = qtyRaw == null || qtyRaw === "" ? 1 : Number(qtyRaw);
      const qty = Number.isFinite(qtyNum) ? qtyNum : 1;
      return sum + Number(priceNum) * qty;
    }, 0);
  }

  computedTotal = Math.round(Math.max(0, Number(computedTotal)));

  // -------------------- Final payload --------------------
  const customerName = bookingData?.info?.name ?? bookingData?.customerName ?? null;
  const phoneContact = bookingData?.info?.phone ?? bookingData?.phoneContact ?? bookingData?.phone ?? null;
  const email = bookingData?.info?.email ?? bookingData?.email ?? null;
  const address = bookingData?.info?.address ?? bookingData?.address ?? null;
  const note = bookingData?.info?.note ?? bookingData?.note ?? null;

  const payload: OrderWithDetailsPayload = {
    customerCode: bookingData?.customerCode ?? null,
    depositDate: bookingData?.depositDate ?? bookingData?.selectedDate ?? null,
    returnDate: bookingData?.returnDate ?? bookingData?.endDate ?? null,
    status: extras?.status ?? bookingData?.status ?? "",
    paymentStatus:extras?.paymentStatus ?? bookingData?.paymentStatus ?? "UnPaid",

    storageTypeId: toNumberSafe(bookingData?.storageTypeId) ?? mapRoomToStorageTypeId(bookingData?.room) ?? null,
    shelfTypeId: 1,
    shelfQuantity: typeof bookingData?.shelfQuantity === "number" ? bookingData.shelfQuantity : bookingData?.counts?.shelves ?? null,

    customerName,
    phoneContact,
    email,
    note,
    address,
    image: bookingData?.image ?? null,
    orderDetails,
    style: options?.mode ?? bookingData?.style ?? null,

    // totals
    totalPrice: computedTotal,
    unpaidAmount: computedTotal,
    // attach original pricing (optional) for traceability
    pricing: bookingData?.pricing ?? undefined,
  };

  return payload;
}
