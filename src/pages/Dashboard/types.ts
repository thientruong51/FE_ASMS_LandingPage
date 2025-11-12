export type WarehouseType = "self" | "managed";

export type OrderStatus =
  | "created"
  | "pickup_scheduled"
  | "picked"
  | "in_warehouse"
  | "out_for_delivery"
  | "delivered"
  | "expired"
  | "cancelled";

export type TrackingRecord = {
  ts: string;
  status: string;
  note?: string;
};

export type Staff = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
};

// ✅ Thêm Item type
export type Item = {
  id: string;
  name: string;
  price: number;
  qty: number;
  size?: string;
  img?: string;
};

// ✅ Cập nhật Order type có thêm items
export type Order = {
  id: string;
  kind: WarehouseType;
  boxes?: number;
  shelves?: number;
  startDate: string; // ISO date
  endDate: string; // ISO date
  status: OrderStatus;
  staff?: Staff;
  tracking: TrackingRecord[];
  items: Item[]; // ✅ thêm trường này
};
