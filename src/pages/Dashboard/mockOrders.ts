import { type Order } from "./types";

export const MOCK_ORDERS: Order[] = [
  {
    id: "ORD-20251101-001",
    kind: "managed",
    boxes: 12,
    startDate: "2025-11-01",
    endDate: "2025-11-29",
    status: "in_warehouse",
    staff: {
      id: "S-01",
      name: "Nguyễn Văn A",
      phone: "+84 912 345 678",
      email: "a@warehouse.vn",
    },
    tracking: [
      {
        ts: "2025-11-01T08:10:00Z",
        status: "Order created",
        note: "Customer booked 12 boxes, pickup scheduled",
      },
      {
        ts: "2025-11-03T09:30:00Z",
        status: "Picked",
        note: "Picked up by warehouse team",
      },
      {
        ts: "2025-11-03T15:00:00Z",
        status: "In warehouse",
        note: "Stored at facility A - Rack 3",
      },
    ],
    // ✅ Items for this order
    items: [
      {
        id: "i1",
        name: "Wooden Chopping Board",
        price: 12,
        qty: 1,
        size: "20 × 10 inch",
        img: "https://images.unsplash.com/photo-1590080875831-13e32dc3b65d?auto=format&fit=crop&w=600&q=60",
      },
      {
        id: "i2",
        name: "Whiter Coffee Mug",
        price: 36,
        qty: 1,
        size: "Regular",
        img: "https://images.unsplash.com/photo-1616627981229-907e17f87e9a?auto=format&fit=crop&w=600&q=60",
      },
    ],
  },
  {
    id: "ORD-20251020-002",
    kind: "self",
    shelves: 1,
    startDate: "2025-10-20",
    endDate: "2025-11-20",
    status: "out_for_delivery",
    staff: {
      id: "S-03",
      name: "Lê Thị B",
      phone: "+84 901 222 333",
    },
    tracking: [
      { ts: "2025-10-20T10:00:00Z", status: "Order created" },
      {
        ts: "2025-10-21T12:00:00Z",
        status: "Customer delivered to facility",
      },
      {
        ts: "2025-11-15T07:30:00Z",
        status: "Out for delivery",
        note: "Preparing to handover to customer",
      },
    ],
    // ✅ Items for this order
    items: [
      {
        id: "i3",
        name: "Sun Screen & Face Serum",
        price: 94,
        qty: 1,
        size: "150 ml",
        img: "https://images.unsplash.com/photo-1600185365483-26d7a4b54b7d?auto=format&fit=crop&w=600&q=60",
      },
      {
        id: "i4",
        name: "Hair Care Product",
        price: 76,
        qty: 1,
        size: "500 ml",
        img: "https://images.unsplash.com/photo-1587019157483-84f1f0f74fd3?auto=format&fit=crop&w=600&q=60",
      },
    ],
  },
];
