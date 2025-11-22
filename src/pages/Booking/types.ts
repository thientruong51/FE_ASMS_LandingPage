export type ServiceSelection = { serviceId: number; name: string; price: number };

export type RoomInfo = {
  id: string;
  name: string;
  hasAC: boolean;
  width?: number;
  depth?: number;
  price?: number;
};

export type ProductTypeSelection = {
  id: number;
  name: string;
  isFragile?: boolean;
  canStack?: boolean;
  description?: string | null;
};

export type BoxInfo = {
  id: string;
  label: string;
  price: number;
  quantity?: number;
  imageUrl?: string | null;
};

export type BoxInfoExtended = BoxInfo & {
  productTypes?: ProductTypeSelection[];
  productTypeIds?: number[];
};

export type PriceBreakdown = {
  basePrice?: number;
  subtotal?: number;
  vatPercentage?: number;
  vatAmount?: number;
  total?: number;
};

export type BookingData = {
  style?: "self" | "full";

  room?: RoomInfo | null;

  box?: BoxInfo | null;

  boxes?: BoxInfoExtended[] | null;

  package?: { id?: string; name?: string; price?: number } | null;

  customItems?: any[];         
  counts?: Record<string, number> | null;

  info?: {
    name: string;
    phone: string;
    email: string; 
    address: string;             
    note?: string;
    services?: number[];     
  } | null;

  selectedDate?: string | null;

  services?: ServiceSelection[] | number[] | null;

  pricing?: PriceBreakdown | null;

  prevStep?: number;
};
