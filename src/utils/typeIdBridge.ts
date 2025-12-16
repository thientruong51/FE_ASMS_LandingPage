
export const STORAGE_TYPE_ID_TO_CODE: Record<number, string> = {
  1: "small",
  2: "small_ac",
  3: "medium",
  4: "medium_ac",
  5: "large",
  6: "large_ac",
  7: "warehouse",
  8: "warehouse_ac",
  9: "warehouse_expired",
  10: "warehouse_oversize",
};

export const SHELF_TYPE_ID_TO_CODE: Record<number, string> = {
  1: "shelf_storage",
  2: "shelf_logistics",
  3: "pallet_rack",
  4: "cantilever",
  5: "mezzanine",
};
