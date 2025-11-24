import axios from "axios";
import { pickStorageForOrder } from "./storage";
import { pickContainerForOrderByType, fetchAvailableContainers } from "./container";
import { fetchStorageTypes } from "./storageType"; 
import type { StorageTypeApi } from "./storageType"; 

const BASE = (import.meta.env.VITE_API_BASE_URL ?? "") as string;
if (!BASE) throw new Error("VITE_API_BASE_URL not defined");

export type OrderDetailPayload = {
  storageCode?: string | null;
  containerCode?: string | null;
  price: number;
  quantity: string;
  image?: string | null;
  containerType?: number | null;
  containerQuantity?: number | null;
  productTypeIds?: number[];
  serviceIds?: number[];
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

  orderDetails: OrderDetailPayload[];
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

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


function mapContainerTypeToId(type: any): number | undefined {
  if (type == null) return undefined;
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
  return Number.isFinite(n) ? n : undefined;
}


async function pickMultipleContainersByType(type: string | number | null, quantity: number): Promise<string[]> {
  const out: string[] = [];
  if (!quantity || quantity <= 0) return out;

  try {
    // @ts-ignore
    if (typeof (await Promise.resolve()).then === "function") {
    }
  } catch (e) {
    // ignore
  }

  try {
    // @ts-ignore
    if (typeof fetchAvailableContainers === "function") {
      let want: string | undefined = undefined;
      if (typeof type === "number") {
        const inv: Record<number, string> = { 1: "A", 2: "B", 3: "C", 4: "D" };
        want = inv[type];
      } else if (typeof type === "string") {
        want = type.trim().toUpperCase();
      }
      const list = await fetchAvailableContainers(undefined);
      const filtered = (list ?? []).filter((c: any) => {
        if (!want) return true;
        return String(c.type ?? "").toUpperCase() === want;
      });
      for (let i = 0; i < Math.min(quantity, filtered.length); i++) {
        const c = filtered[i];
        if (c && c.containerCode) out.push(c.containerCode);
      }
      if (out.length === quantity) return out;
    }
  } catch (err) {
    // ignore and fallback
  }

  for (let i = out.length; i < quantity; i++) {
    try {
  
      const picked = await pickContainerForOrderByType(type ?? undefined);
      if (picked && picked.containerCode) {
        out.push(picked.containerCode);
      } else {
        break;
      }
    } catch (e) {
      break;
    }
  }

  return out;
}

export async function createOrderWithDetails(payload: OrderWithDetailsPayload) {
  const url = `${BASE}/api/Order/with-details`;
  const res = await axios.post<ApiResponse<any>>(url, payload);
  return res.data;
}


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
    options?.mode ??
    (bookingData.style === "self" ? "self" : bookingData.style === "full" ? "full" : undefined);

  const orderDetails: OrderDetailPayload[] = [];

  const globalProductTypeIds = ensureNumberArray(bookingData.productTypeIds ?? bookingData.selectedProductTypeIds ?? bookingData.productTypes ?? []);
  const globalServiceIds = ensureNumberArray(bookingData.services ?? bookingData.serviceIds ?? []);

  const countsPricing = (bookingData?.counts?.pricingInfo ?? null) as any | null;
  const pricingObj = bookingData?.pricing ?? null;

  const perShelfPrice = toNumberSafe(countsPricing?.perShelfPrice) ?? toNumberSafe(pricingObj?.perShelfPrice) ?? toNumberSafe(countsPricing?.shelfPrice) ?? toNumberSafe(pricingObj?.shelfPrice) ?? 0;
  const perBoxDefault = toNumberSafe(countsPricing?.perBoxPrice) ?? toNumberSafe(pricingObj?.perBoxPrice) ?? 0;
  const boxPricesMap = (countsPricing?.boxPricesMap && typeof countsPricing.boxPricesMap === "object") ? countsPricing.boxPricesMap : (pricingObj?.boxPricesMap ?? {});


  if (mode === "self") {
    const hasAC = typeof options?.buildingHasAC === "boolean" ? options.buildingHasAC : Boolean(bookingData?.room?.hasAC);
    const buildingCode = options?.buildingCodeOverride ?? (hasAC ? "BLD003" : "BLD002");


    const chosenStorageTypeId =
      toNumberSafe(options?.chosenStorageTypeId) ??
      toNumberSafe(bookingData?.storageTypeId) ??
      mapRoomToStorageTypeId(bookingData?.room) ??
      undefined;

    const pickedStorage = await pickStorageForOrder(buildingCode, chosenStorageTypeId as any);

    if (!pickedStorage) {
      if (chosenStorageTypeId != null) {
        throw new Error(`Không tìm thấy kho trạng thái Ready cho storageTypeId=${chosenStorageTypeId} tại building ${buildingCode}`);
      } else {
        throw new Error(`Không tìm thấy kho trạng thái Ready tại building ${buildingCode}`);
      }
    }


    let storagePrice: number = 0;

    try {
      const storageTypeIdToLookup = toNumberSafe(chosenStorageTypeId) ?? toNumberSafe(pickedStorage?.storageTypeId) ?? undefined;
      if (storageTypeIdToLookup != null) {
        const storageTypes: StorageTypeApi[] = await fetchStorageTypes();
        const found = storageTypes.find((s) => Number(s.storageTypeId) === Number(storageTypeIdToLookup));
        const foundPrice = toNumberSafe(found?.price);
        if (foundPrice != null) {
          storagePrice = Number(foundPrice);
        }
      }
    } catch (err) {
      // ignore errors; storagePrice stays 0
    }

    const byType: Record<string, number> = (bookingData?.counts?.byType && typeof bookingData.counts.byType === "object") ? bookingData.counts.byType : {};
    if ((!byType || Object.keys(byType).length === 0) && Array.isArray(bookingData?.customItems)) {
      for (const it of bookingData.customItems) {
        const k = String(it?.type ?? it?.label ?? it?.name ?? "").toUpperCase();
        byType[k] = (byType[k] ?? 0) + 1;
      }
    }

    const shelfQuantity = toNumberSafe(bookingData?.shelfQuantity) ?? toNumberSafe(bookingData?.counts?.shelves) ?? (byType["SHELF"] ?? byType["shelf"] ?? byType["Shelf"] ?? 0);


    orderDetails.push({
      storageCode: pickedStorage.storageCode,
      containerCode: undefined,
      price: Number(storagePrice),
      quantity: String(1),
      image: bookingData?.room?.image ?? null,
      containerType: undefined,
      containerQuantity: undefined,
      productTypeIds: globalProductTypeIds,
      serviceIds: globalServiceIds,
      storageTypeId: chosenStorageTypeId ?? undefined,
      shelfTypeId: undefined,
      shelfQuantity: undefined,
    });

    const shelfTypeId = 1;
    if (shelfQuantity && shelfQuantity > 0) {
      const shelfTotalPrice = Number((perShelfPrice ?? 0) * shelfQuantity);
      orderDetails.push({
        storageCode: undefined,
        containerCode: undefined,
        price: Number(shelfTotalPrice),
        quantity: String(shelfQuantity),
        image: null,
        containerType: undefined,
        containerQuantity: Number(shelfQuantity),
        productTypeIds: [],
        serviceIds: [], 
        shelfTypeId,
        shelfQuantity: Number(shelfQuantity),
      });
    }

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
      orderDetails.push({
        storageCode: undefined,
        containerCode: undefined,
        price: Number((unitPrice ?? 0) * Number(cnt ?? 0)),
        quantity: String(cnt ?? 0),
        image: null,
        containerType: numericType ?? undefined,
        containerQuantity: Number(cnt ?? 0),
        productTypeIds: [],
        serviceIds: [],
      });
    }
  }


  else if (mode === "full") {
    const boxesArr = Array.isArray(bookingData?.boxes) ? bookingData.boxes : (Array.isArray(bookingData?.boxPayload?.boxes) ? bookingData.boxPayload.boxes : []);

    if ((!boxesArr || boxesArr.length === 0) && bookingData?.box) {
      boxesArr.push(bookingData.box);
    }

    if ((!boxesArr || boxesArr.length === 0) && (options?.chosenContainerType ?? bookingData.containerType)) {
      const boxType = options?.chosenContainerType ?? bookingData.containerType;
      const qty = Number(bookingData.quantity ?? bookingData.containerQuantity ?? 1) || 1;
      const codes = await pickMultipleContainersByType(boxType, qty);
      if (codes.length === 0) {
        throw new Error(`Không có container Available cho loại ${boxType}`);
      }
      for (const c of codes) {
        const unitPrice = toNumberSafe(boxPricesMap?.[String(boxType).toUpperCase()]) ?? toNumberSafe(bookingData.price) ?? 0;
        orderDetails.push({
          storageCode: null,
          containerCode: c,
          price: Number(unitPrice),
          quantity: "1",
          image: null,
          containerType: mapContainerTypeToId(boxType) ?? undefined,
          containerQuantity: 1,
          productTypeIds: ensureNumberArray(bookingData.productTypeIds ?? bookingData.productTypes ?? globalProductTypeIds),
          serviceIds: ensureNumberArray(bookingData.services ?? bookingData.serviceIds ?? globalServiceIds),
        });
      }
    } else {
      for (const b of boxesArr) {
        const label = b.label ?? b.type ?? b.id ?? b.name;
        const quantity = Number(b.quantity ?? b.qty ?? 1) || 1;
        const unitFromBox = toNumberSafe(b.price ?? b.unitPrice) ?? toNumberSafe(boxPricesMap?.[String(label).toUpperCase()]) ?? perBoxDefault ?? 0;

        const codes = await pickMultipleContainersByType(label, quantity);

        if (!codes || codes.length === 0) {
          for (let i = 0; i < quantity; i++) {
            orderDetails.push({
              storageCode: null,
              containerCode: undefined,
              price: Number(unitFromBox),
              quantity: "1",
              image: b.imageUrl ?? b.image ?? null,
              containerType: mapContainerTypeToId(label) ?? undefined,
              containerQuantity: 1,
              productTypeIds: ensureNumberArray(b.productTypeIds ?? b.productTypes ?? globalProductTypeIds),
              serviceIds: ensureNumberArray(bookingData.services ?? bookingData.serviceIds ?? globalServiceIds),
            });
          }
        } else {
          for (let i = 0; i < quantity; i++) {
            const code = codes[i] ?? undefined;
            orderDetails.push({
              storageCode: null,
              containerCode: code ?? undefined,
              price: Number(unitFromBox),
              quantity: "1",
              image: b.imageUrl ?? b.image ?? null,
              containerType: mapContainerTypeToId(label) ?? undefined,
              containerQuantity: 1,
              productTypeIds: ensureNumberArray(b.productTypeIds ?? b.productTypes ?? globalProductTypeIds),
              serviceIds: ensureNumberArray(bookingData.services ?? bookingData.serviceIds ?? globalServiceIds),
            });
          }
        }
      }
    }
  } else {
    throw new Error("Không xác định được mode (self/full) từ bookingData hoặc options.");
  }


  const customerName = bookingData?.info?.name ?? bookingData?.customerName ?? null;
  const phoneContact = bookingData?.info?.phone ?? bookingData?.phoneContact ?? bookingData?.phone ?? null;
  const email = bookingData?.info?.email ?? bookingData?.email ?? null;
  const address = bookingData?.info?.address ?? bookingData?.address ?? null;
  const note = bookingData?.info?.note ?? bookingData?.note ?? null;

  const payload: OrderWithDetailsPayload = {
    customerCode: bookingData?.customerCode ?? null,
    depositDate: bookingData?.depositDate ?? bookingData?.selectedDate ?? null,
    returnDate: bookingData?.returnDate ?? bookingData?.endDate ?? null,
    status: extras?.status ?? bookingData?.status ?? "new",
    paymentStatus: extras?.paymentStatus ?? bookingData?.paymentStatus ?? (extras?.paymentMethod === "card" ? "Paid" : "Pending"),

    storageTypeId: toNumberSafe(bookingData?.storageTypeId) ?? mapRoomToStorageTypeId(bookingData?.room) ?? undefined,
    shelfTypeId: 1,
    shelfQuantity: typeof bookingData?.shelfQuantity === "number" ? bookingData.shelfQuantity : (bookingData?.counts?.shelves ?? undefined),

    customerName,
    phoneContact,
    email,
    note,
    address,
    image: bookingData?.image ?? null,

    orderDetails,
  };

  return payload;
}
