// ==============================
// RAW API TYPES
// ==============================

export type WarehouseType = "self" | "managed";

// Raw status từ API
export type ApiOrderStatus = string;

export type TrackingRecord = { ts: string; status: string; note?: string };

export type Staff = { id?: string; name: string; phone?: string; email?: string };

// Chi tiết từ API OrderDetail
export type OrderDetailApi = {
  orderDetailId: number;
  storageCode: string | null;
  containerCode: string | null;
  floorCode: string | null;
  floorNumber: number | null;
  price: number;
  quantity: string | number;
  subTotal: number;
  image: string | null;
  containerType: number | null;
  containerQuantity: number | null;
  storageTypeId: number | null;
  shelfTypeId: number | null;
  shelfQuantity: number | null;

  productTypeNames?: string[];
  serviceNames?: string[];
  isPlaced?: boolean;
};

// Summary từ /api/Order
export type OrderSummaryApi = {
  orderCode: string;
  customerCode: string | null;
  orderDate: string | null;
  depositDate: string | null;
  returnDate: string | null;
  status: string;
  paymentStatus: string;
  totalPrice: number;
  unpaidAmount: number;
  style?: string | null;
};

// ==============================
// UI INTERNAL TYPES
// ==============================

export type DisplayStatus =
  | "Pending"
  | "WaitPickUp"
  | "Verify"
  | "Checkout"
  | "PickUp"
  | "Processing"
  | "Stored"
  | "Renting"
  | "Overdue"
  | "ExpiredStorage"
  | "Retrieved"
  | string;

// Item hiển thị UI
export type Item = {
  id: string;
  name: string;
  price: number;
  qty: number;
  img?: string | null;

  raw?: Partial<OrderDetailApi>;

  productTypeNames?: string[];
  serviceNames?: string[];
  isPlaced?: boolean;
};

// ==============================
// MAIN ORDER TYPE CHO UI DASHBOARD
// ==============================

export type Order = {
  paymentStatus: any;
  orderCode: any;
  id: string;
  kind: WarehouseType;

  startDate: string | null;
  endDate: string | null;

  status: ApiOrderStatus;
  displayStatus?: DisplayStatus;

  staff?: Staff;
  tracking: TrackingRecord[];

  items: Item[];

  rawSummary?: OrderSummaryApi | null;
  rawDetails?: OrderDetailApi[] | null;

  totalPrice?: number | null;
  unpaidAmount?: number | null;

  boxes?: number; // tổng qty items
};
