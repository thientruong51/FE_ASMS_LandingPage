
export const STORAGE_TYPE_ID_TO_CODE: Record<number, string> = {
  1: "small",
  6: "small_ac",
  2: "medium",
  7: "medium_ac",
  3: "large",
  8: "large_ac",
  4: "warehouse",
  9: "warehouse_ac",
  5: "warehouse_expired",
  10: "warehouse_oversize",
};

export const SHELF_TYPE_ID_TO_CODE: Record<number, string> = {
  1: "shelf_storage",
  2: "shelf_logistics",
  3: "pallet_rack",
  4: "cantilever",
  5: "mezzanine",
};
