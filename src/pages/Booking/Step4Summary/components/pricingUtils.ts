import { useMemo } from "react";
import type { BookingPayload, ServiceSelection } from "./types";

export const toNumber = (v: unknown): number | undefined => {
  if (v === null || v === undefined) return undefined;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) return Number(v);
  return undefined;
};

export const normalizeMap = (m: unknown): Record<string, number> => {
  if (!m || typeof m !== "object") return {};
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(m as Record<string, unknown>)) {
    const n = toNumber(v);
    if (typeof n === "number") out[k] = n;
  }
  return out;
};

export function usePricing(data: BookingPayload, serviceDetails: ServiceSelection[] | null) {
  return useMemo(() => {

    /** -----------------------------
     * ITEMS / SERVICE PRICE
     * ----------------------------- */
    const itemsArray =
      Array.isArray(data.items)
        ? data.items
        : Array.isArray(data.customItems)
        ? data.customItems
        : Array.isArray((data.customItems as any)?.items)
        ? (data.customItems as any).items
        : [];

    const serviceExtras = (serviceDetails ?? []).reduce((s, sv) => s + (sv.price ?? 0), 0);

    /** -----------------------------
     * BASE PRICE (MONTHLY)
     * ----------------------------- */
    const basePrice =
      toNumber((data.pricing as any)?.basePrice) ??
      toNumber(data.room?.price) ??
      toNumber(data.box?.price) ??
      (typeof data.room?.name === "string" &&
      data.room.name.toLowerCase().includes("medium")
        ? 1485000
        : 1200000);

    /** -----------------------------
     * PRICE PER ITEMS (kệ / hộp)
     * ----------------------------- */
    const explicitItemPriceSum = itemsArray.reduce(
      (s: number, it: { price: unknown }) => s + (toNumber(it?.price) ?? 0),
      0
    );

    const unpriced = itemsArray.filter(
      (it: { price: unknown }) => toNumber(it?.price) === undefined
    );

    const raw = ((data.counts as any)?.pricingInfo ?? null) as any | null;

    const perShelfFromCounts = toNumber(raw?.perShelfPrice ?? raw?.shelfPrice);
    const perShelfFromPricing = toNumber(
      (data.pricing as any)?.perShelfPrice ?? (data.pricing as any)?.shelfPrice
    );

    const perBoxFromCounts = toNumber(raw?.perBoxPrice ?? raw?.boxPrice);
    const perBoxFromPricing = toNumber(
      (data.pricing as any)?.perBoxPrice ?? (data.pricing as any)?.boxPrice
    );

    const boxPricesMap = normalizeMap(
      raw?.boxPricesMap ?? (data.pricing as any)?.boxPrices ?? {}
    );
    const shelfPriceMap = normalizeMap(
      raw?.shelfPriceMap ?? (data.pricing as any)?.shelfPriceMap ?? {}
    );

    const e = {
      perShelfPrice: perShelfFromCounts ?? perShelfFromPricing,
      perBoxPrice: perBoxFromCounts ?? perBoxFromPricing,
      boxPricesMap,
      shelfPriceMap,
    };

    let inferredShelvesTotal = 0;
    let inferredBoxesTotal = 0;
    let inferredOtherTotal = 0;

    for (const it of unpriced) {
      const type = (it?.type ?? "").toString();

      // shelf
      if (/shelf/i.test(type)) {
        const found = Object.keys(e.shelfPriceMap || {}).find(
          (k) =>
            k.toLowerCase() === type.toLowerCase() ||
            type.toLowerCase().includes(k.toLowerCase())
        );
        const perShelf = toNumber(found ? e.shelfPriceMap[found] : e.perShelfPrice);
        if (typeof perShelf === "number") inferredShelvesTotal += perShelf;
        continue;
      }

      // container
      if (/^[ABCD]$/i.test(type) || /box|container|crate/i.test(type)) {
        const up = type.toUpperCase();
        const unit =
          toNumber(e.boxPricesMap?.[up]) ?? toNumber(e.perBoxPrice);
        if (typeof unit === "number") inferredBoxesTotal += unit;
        continue;
      }

      // match by fallback maps
      const foundShelf2 = Object.keys(e.shelfPriceMap || {}).find(
        (k) =>
          k.toLowerCase() === type.toLowerCase() ||
          type.toLowerCase().includes(k.toLowerCase())
      );
      if (foundShelf2) {
        inferredOtherTotal += e.shelfPriceMap[foundShelf2];
        continue;
      }
      const foundBox2 = Object.keys(e.boxPricesMap || {}).find(
        (k) =>
          k.toLowerCase() === type.toLowerCase() ||
          type.toLowerCase().includes(k.toLowerCase())
      );
      if (foundBox2) {
        inferredOtherTotal += e.boxPricesMap[foundBox2];
        continue;
      }
    }

    const inferredItemsExtra =
      inferredShelvesTotal + inferredBoxesTotal + inferredOtherTotal;
    const itemsTotal = explicitItemPriceSum + inferredItemsExtra;

    /** ---------------------------------------
     * RENTAL MULTIPLIER — ADD THIS SECTION
     * --------------------------------------- */
    let rentalMultiplier = 1;

    if (data.rentalType === "week") {
      const w = data.rentalWeeks ?? 1;
      rentalMultiplier = 0.3 * w; // each week = 0.3 month
    } else if (data.rentalType === "month") {
      rentalMultiplier = 1;
    } else if (data.rentalType === "custom") {
      const months = data.rentalMonths ?? 1;
      rentalMultiplier = months;
    }

    const rentalAdjustedBase = Math.round(basePrice * rentalMultiplier);

    /** -----------------------------
     * FINAL TOTAL CALC
     * ----------------------------- */
    const subtotal =
      toNumber((data.pricing as any)?.subtotal) ??
      Math.round(rentalAdjustedBase + serviceExtras + itemsTotal);

    const vatPercentage = toNumber((data.pricing as any)?.vatPercentage) ?? 8;
    const vatAmount =
      toNumber((data.pricing as any)?.vatAmount) ??
      Math.round((subtotal * vatPercentage) / 100);

    const total =
      toNumber((data.pricing as any)?.total) ?? subtotal + vatAmount;

    return {
      basePrice,
      rentalAdjustedBase,
      subtotal,
      vatPercentage,
      vatAmount,
      total,
      rentalMultiplier,
      rentalType: data.rentalType,
      rentalWeeks: data.rentalWeeks,
      rentalMonths: data.rentalMonths,

      breakdown: {
        serviceExtras,
        explicitItemPriceSum,
        inferredShelvesTotal,
        inferredBoxesTotal,
        inferredOtherTotal,
        inferredItemsExtra,
        itemsTotal,
      },
      effectivePricingInfo: e,
    } as const;
  }, [data, serviceDetails]);
}
