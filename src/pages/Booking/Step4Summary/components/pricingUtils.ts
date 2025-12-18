// pricingUtils.ts
import { useMemo } from "react";
import type { BookingPayload, ServiceSelection } from "./types";

/* ---------- helpers ---------- */
export const toNumber = (v: unknown): number | undefined => {
  if (v === null || v === undefined) return undefined;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) return Number(v);
  return undefined;
};

const normalizeMap = (m: unknown): Record<string, number> => {
  if (!m || typeof m !== "object") return {};
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(m as Record<string, unknown>)) {
    const n = toNumber(v);
    if (typeof n === "number") out[k] = n;
  }
  return out;
};

function inferSurchargePercentFromName(name?: string) {
  if (!name) return undefined;
  const s = name.toLowerCase();
  if (s.includes("dễ vỡ") || s.includes("fragile")) return 20;
  if (s.includes("điện tử") || s.includes("electronic") || s.includes("electronics")) return 10;
  if (s.includes("lạnh") || s.includes("cold") || s.includes("refriger")) return 15;
  if (s.includes(">20kg") || s.includes("nặng") || s.includes("heavy")) return 25;
  return undefined;
}

/* ---------- shipping table ---------- */
const SHIPPING_TABLE = {
  fixed: [
    [60000, 100000, 120000],
    [90000, 130000, 160000],
    [130000, 180000, 220000],
  ],
  perKm: [10000, 9000, 8000],
};

function shippingBucketForBoxCount(boxCount: number) {
  if (boxCount <= 0) return null;
  if (boxCount <= 5) return 0;
  if (boxCount <= 20) return 1;
  return 2;
}

function distanceBucket(distanceInKm?: number) {
  if (typeof distanceInKm !== "number" || isNaN(distanceInKm)) return null;
  if (distanceInKm <= 5) return 0;
  if (distanceInKm <= 10) return 1;
  if (distanceInKm <= 20) return 2;
  return 3;
}

/* ---------- main hook ---------- */
export function usePricing(data: BookingPayload, serviceDetails: ServiceSelection[] | null) {
  return useMemo(() => {
    // items compatibility
    const itemsArray =
      Array.isArray((data as any).items)
        ? (data as any).items
        : Array.isArray((data as any).customItems)
          ? (data as any).customItems
          : Array.isArray(((data as any).customItems as any)?.items)
            ? ((data as any).customItems as any).items
            : [];

    const serviceExtras = (serviceDetails ?? []).reduce((s, sv) => s + (sv.price ?? 0), 0);

    // basePrice fallback (will be ignored for full-service)
    const rawBase =
      toNumber((data as any).pricing?.basePrice) ??
      toNumber((data as any).room?.price) ??
      toNumber((data as any).box?.price) ??
      (typeof (data as any).room?.name === "string" &&
        (data as any).room.name.toLowerCase().includes("medium")
        ? 1485000
        : 1200000);

    // rental multiplier
    const rt = (data as any).rentalType ?? data.rentalType;
    const weeks = Number((data as any).rentalWeeks ?? data.rentalWeeks ?? 0);
    const months = Number((data as any).rentalMonths ?? data.rentalMonths ?? 0);
    const daysCustom = Number((data as any).rentalDays ?? data.rentalDays ?? 0);

    let rentalMultiplier = 1;
    if (rt === "week") {
      const w = weeks > 0 ? weeks : 1;
      rentalMultiplier = 0.3 * w;
    } else if (rt === "month") {
      rentalMultiplier = months > 0 ? months : 1;
    } else if (rt === "custom") {
      if (daysCustom > 0) rentalMultiplier = daysCustom / 30;
      else rentalMultiplier = months > 0 ? months : 1;
    } else {
      rentalMultiplier = months > 0 ? months : 1;
    }

    // Decide whether this booking is full-service (box flow) or self-storage
    const style =
      (data as any).style ??
      data.style ??
      (Array.isArray((data as any).boxes) && (data as any).boxes.length > 0 ? "full" : (data as any).room ? "self" : undefined);
    const isFull = style === "full";
const isSelf = style === "self";
    // For self-storage, base applies; for full-service, basePrice is effectively 0 (avoid double-count)
    const basePrice = isFull ? 0 : rawBase;
    const rentalAdjustedBase = isFull ? 0 : Math.round((Number(basePrice) || 0) * rentalMultiplier);
const boxPricesMap = normalizeMap(
  ((data as any).counts as any)?.pricingInfo?.boxPricesMap ??
  (data as any).pricing?.boxPrices ??
  {}
);
    // boxes / boxCount
    let boxCount = 0;
let boxesList: any[] = [];

// 1️⃣ FULL mode: dùng boxes thật
if (Array.isArray((data as any).boxes) && (data as any).boxes.length > 0) {
  boxesList = (data as any).boxes;
  boxCount = boxesList.reduce(
    (s, b) => s + (Number(b.quantity ?? b.qty ?? 1) || 0),
    0
  );
}

// 2️⃣ SELF mode: build boxes từ counts.byType
else if (
  isSelf &&
  (data as any).counts?.byType &&
  typeof (data as any).counts.byType === "object"
) {
  const byType = (data as any).counts.byType;

  for (const [type, qtyRaw] of Object.entries(byType)) {
    const qty = Number(qtyRaw) || 0;
    if (qty <= 0) continue;

    // chỉ nhận box A/B/C/D
    if (!/^[ABCD]$/i.test(type)) continue;

    boxesList.push({
      label: type.toUpperCase(),
      quantity: qty,
      unitPrice: boxPricesMap[type.toUpperCase()] ?? 0,
    });

    boxCount += qty;
  }
}

    // ---------- explicit items (exclude box-like items so we don't double count) ----------
    // build set of identifiers from boxesList for robust matching
    const boxIdentifiers = new Set<string>();
    for (const b of boxesList) {
      if (b == null) continue;
      if (b.id != null) boxIdentifiers.add(String(b.id));
      if (b.boxId != null) boxIdentifiers.add(String(b.boxId));
      if (b.containerTypeId != null) boxIdentifiers.add(String(b.containerTypeId));
      if (typeof b.label === "string" && b.label.trim() !== "") boxIdentifiers.add(b.label.trim().toLowerCase());
      if (typeof b.name === "string" && b.name.trim() !== "") boxIdentifiers.add(b.name.trim().toLowerCase());
      if (typeof b.type === "string" && b.type.trim() !== "") boxIdentifiers.add(b.type.trim().toLowerCase());
    }

    function looksLikeBoxItem(it: any) {
      if (!it) return false;
      if (it.isBox === true || it.isContainer === true) return true;
      if (it.boxId != null && boxIdentifiers.has(String(it.boxId))) return true;
      if (it.containerTypeId != null && boxIdentifiers.has(String(it.containerTypeId))) return true;
      if (it.id != null && boxIdentifiers.has(String(it.id))) return true;
      const t = ((it.type ?? it.label ?? it.name) ?? "").toString().trim().toLowerCase();
      if (!t) return false;
      if (boxIdentifiers.has(t)) return true;
      if (/^[abcd]$/i.test(t) || /box|container|crate/i.test(t)) return true;
      return false;
    }

    const explicitItemPriceSum = (itemsArray as any[])
      .filter((it) => !looksLikeBoxItem(it))
      .reduce((s: number, it: { price: unknown }) => s + (toNumber(it?.price) ?? 0), 0);

    // surcharge map & product types
    const surchargeMapFromPayload = normalizeMap((data as any).pricing?.productTypeSurcharges ?? {});
    const productTypesById = new Map<number, any>();
    if (Array.isArray((data as any).productTypes)) {
      for (const pt of (data as any).productTypes) {
        const id = Number(pt?.id ?? pt?.productTypeId ?? NaN);
        if (!Number.isNaN(id)) productTypesById.set(id, pt);
      }
    }
    const boxPayload = (data as any).boxPayload ?? (data as any).productPayload ?? null;
    if (boxPayload && Array.isArray(boxPayload.productTypes)) {
      for (const pt of boxPayload.productTypes) {
        const id = Number(pt?.productTypeId ?? pt?.id ?? NaN);
        if (!Number.isNaN(id)) productTypesById.set(id, pt);
      }
    }

    function surchargePercentForBox(box: any): number {
      const productTypeIds: number[] =
        Array.isArray(box.productTypeIds) && box.productTypeIds.length > 0
          ? box.productTypeIds.map((x: any) => Number(x)).filter((n: unknown) => !Number.isNaN(n))
          : Array.isArray(box.productTypes) && box.productTypes.length > 0
            ? box.productTypes.map((pt: any) => Number(pt?.id ?? pt?.productTypeId)).filter((n: unknown) => !Number.isNaN(n))
            : [];

      let best = 0;
      for (const id of productTypeIds) {
        if (id in surchargeMapFromPayload) {
          const p = Number(surchargeMapFromPayload[id]);
          if (!Number.isNaN(p)) best = Math.max(best, p);
          continue;
        }
        const ptObj =
          productTypesById.get(id) ?? (Array.isArray(box.productTypes) ? box.productTypes.find((x: any) => Number(x?.id ?? x?.productTypeId) === id) : null);
        if (ptObj) {
          if (ptObj.surchargePercent != null) {
            const p = toNumber(ptObj.surchargePercent);
            if (typeof p === "number") best = Math.max(best, p);
          }
          if (ptObj.isFragile) best = Math.max(best, 20);
          if (ptObj.isCold || (ptObj.name && /cold|lạnh|kho lạnh/i.test(String(ptObj.name)))) best = Math.max(best, 15);
          if (/electro|điện tử|electron/i.test(String(ptObj.name ?? ""))) best = Math.max(best, 10);
          if (ptObj.isHeavy || />20kg|nặng|heavy/i.test(String(ptObj.name ?? ""))) best = Math.max(best, 25);
          const h = inferSurchargePercentFromName(String(ptObj.name ?? ""));
          if (h) best = Math.max(best, h);
        }
      }

      if (productTypeIds.length === 0) {
        const name = String(box.label ?? box.name ?? box.type ?? "");
        const h = inferSurchargePercentFromName(name);
        if (h) best = Math.max(best, h);
        if (box.isFragile) best = Math.max(best, 20);
        if (box.isCold) best = Math.max(best, 15);
        if (box.isHeavy) best = Math.max(best, 25);
      }

      return best;
    }
const hasTypedBoxes =
  Array.isArray((data as any).counts?.byType) ||
  (data as any).counts?.byType &&
  Object.keys((data as any).counts.byType).some(k =>
    /^[ABCD]$/i.test(k)
  );

    // compute boxes price + surcharges
    let boxesPriceRaw = 0;
    let totalSurchargesAmount = 0;

    if (boxesList && boxesList.length > 0) {
      for (const b of boxesList) {
        const qty = Number(b.quantity ?? b.qty ?? 1) || 1;
        const unit =
  hasTypedBoxes
    ? toNumber(b.unitPrice ?? 0) ?? 0   
    : toNumber(b.price ?? b.unitPrice ?? 0) ?? 0;
        const base = unit * qty;
        boxesPriceRaw += base;

        const pct = surchargePercentForBox(b) ?? 0;
        const surchargeAmt = Math.round((base * pct) / 100);
        totalSurchargesAmount += surchargeAmt;
      }
    }

    // shipping
    const distanceInKm = toNumber((data as any).distanceInKm ?? data.distanceInKm) ?? null;
    const DELIVERY_ID_FALLBACK = 4;
    const deliveryIdFromPricing = Number((data as any).pricing?.deliveryServiceId ?? NaN);
    const deliveryIds: number[] = Array.isArray((data as any).pricing?.deliveryServiceIds)
      ? (data as any).pricing.deliveryServiceIds.map((x: any) => Number(x)).filter((n: number) => !Number.isNaN(n))
      : [Number.isNaN(deliveryIdFromPricing) ? DELIVERY_ID_FALLBACK : deliveryIdFromPricing];

    const selectedServices = Array.isArray(data.services) ? data.services.map((s: any) => Number(s)).filter((n: number) => !Number.isNaN(n)) : [];
    const isDeliverySelected = selectedServices.some((s) => deliveryIds.includes(s));

    let shippingFee = 0;
    let shippingBucket: number | null = null;
    let distanceBucketIndex: number | null = null;

    if (isDeliverySelected && boxCount > 0 && distanceInKm != null) {
      shippingBucket = shippingBucketForBoxCount(boxCount);
      distanceBucketIndex = distanceBucket(distanceInKm);

      if (shippingBucket !== null && distanceBucketIndex !== null) {
        if (distanceBucketIndex === 3) {
          const perKm = SHIPPING_TABLE.perKm[shippingBucket] ?? SHIPPING_TABLE.perKm[2];
          shippingFee = Math.round(perKm * distanceInKm);
        } else {
          shippingFee = SHIPPING_TABLE.fixed[distanceBucketIndex][shippingBucket];
        }

        const rentalDurationMonths = rentalMultiplier;
        if (rentalDurationMonths >= 1) {
          shippingFee = Math.round(shippingFee * 0.9);
        }
      }
    } else {
      shippingFee = 0;
    }

    // monthly-priced items (kệ + thùng)
    const monthlyItemsRaw = boxesPriceRaw;

    // nhân số tháng thuê cho kệ + thùng
    const rentalAdjustedItems = monthlyItemsRaw;

    // one-time items (KHÔNG nhân tháng)
    const oneTimeItems = explicitItemPriceSum + totalSurchargesAmount;

    // tổng items cuối cùng
    const itemsTotal = rentalAdjustedItems + oneTimeItems;


    // subtotal rules:
    // - full-service: don't include rentalAdjustedBase (basePrice) because item prices already represent box prices
    // - self-storage: include rentalAdjustedBase
    let computedSubtotal: number;
    if (isFull) {
      computedSubtotal = Math.round(
        itemsTotal * rentalMultiplier +
        serviceExtras +
        shippingFee
      );
    } else {
      computedSubtotal =
        rentalAdjustedBase +
        serviceExtras +
       Math.round(
  (monthlyItemsRaw + oneTimeItems) * rentalMultiplier
) +
        shippingFee;
    }

    const subtotal = toNumber((data as any).pricing?.subtotal) ?? computedSubtotal;
    const total = subtotal; // VAT removed

    return {
      basePrice,
      rentalAdjustedBase,
      subtotal,
      total,
      rentalMultiplier,
      rentalType: rt,
      rentalWeeks: weeks,
      rentalMonths: months,
      rentalDays: daysCustom,

      breakdown: {
        serviceExtras,
        explicitItemPriceSum,
        boxesPriceRaw,
        totalSurchargesAmount,
        itemsTotal,
        shippingFee,
        boxCount,
        boxesList,
      },

      shipping: {
        isDeliverySelected,
        distanceInKm,
        shippingBucket,
        distanceBucket: distanceBucketIndex,
      },

      effectivePricingInfo: {
        perShelfPrice:
          toNumber(((data as any).counts as any)?.pricingInfo?.perShelfPrice ?? (data as any).pricing?.perShelfPrice) ?? undefined,
        perBoxPrice: toNumber(((data as any).counts as any)?.pricingInfo?.perBoxPrice ?? (data as any).pricing?.perBoxPrice) ?? undefined,
        boxPricesMap: normalizeMap(((data as any).counts as any)?.pricingInfo?.boxPricesMap ?? (data as any).pricing?.boxPrices ?? {}),
        shelfPriceMap: normalizeMap(((data as any).counts as any)?.pricingInfo?.shelfPriceMap ?? (data as any).pricing?.shelfPriceMap ?? {}),
        productTypeSurcharges: normalizeMap((data as any).pricing?.productTypeSurcharges ?? {}),
      } as const,
    } as const;
  }, [data, serviceDetails]);
}
