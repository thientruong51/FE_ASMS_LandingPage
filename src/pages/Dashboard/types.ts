
export type WarehouseType = "self" | "managed";

export type OrderStatus =
  | "new"
  | "created"
  | "pickup_scheduled"
  | "picked"
  | "in_warehouse"
  | "out_for_delivery"
  | "delivered"
  | "expired"
  | "cancelled";

export type TrackingRecord = { ts: string; status: string; note?: string };

export type Staff = { id: string; name: string; phone?: string; email?: string };

export type Item = {
  id: string;
  name: string;
  price: number;
  qty: number;
  size?: string;
  img?: string;
};

export type Order = {
  id: string;
  kind: WarehouseType;
  boxes?: number;
  shelves?: number;
  startDate: string | null;     
  endDate: string | null;       
  status: OrderStatus | string; 
  staff?: Staff;
  tracking: TrackingRecord[];
  items: Item[];
};
