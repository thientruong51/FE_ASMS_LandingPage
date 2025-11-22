export type ServiceSelection = {
  serviceId: number;
  name: string;
  price: number;
};

export type BookingPayload = {
  style?: string;
  room?: any;
  box?: any;
  items?: any[];
  counts?: {
    shelves?: number;
    boxes?: number;
    totalShelves?: number;
    byType?: Record<string, number>;
    pricingInfo?: any;
  } | null;
  customItems?: any[] | { items: any[]; counts?: any } | null;
  info?: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    note?: string;
  } | null;
  selectedDate?: string | null;
  services?: number[] | ServiceSelection[] | null;
  pricing?: any;
  paymentMethod?: string;
  [k: string]: any;
};
