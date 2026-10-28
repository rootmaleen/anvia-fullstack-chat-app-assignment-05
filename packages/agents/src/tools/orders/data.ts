// Mock orders for demos and evals. Dates are relative to now, so return windows stay predictable.

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const daysAgo = (days: number) => new Date(Date.now() - days * DAY).toISOString();
const hoursFromNow = (hours: number) => new Date(Date.now() + hours * HOUR).toISOString();

/** Return period in calendar days after delivery, as in the returns policy. */
export const RETURN_WINDOW_DAYS = 7;

export type Order = {
  id: string;
  email: string;
  status: "Menunggu Pembayaran" | "Sedang Dikemas" | "Dalam Pengiriman" | "Telah Diterima";
  items: { name: string; quantity: number; price: number }[];
  shippingFee: number;
  insuranceFee: number;
  total: number;
  paymentMethod: string;
  paymentDeadline?: string;
  destinationCity: string;
  courier?: string;
  trackingNumber?: string;
  orderedAt: string;
  deliveredAt?: string;
};

export type Shipment = {
  courier: string;
  estimatedDelivery?: string;
  events: { time: string; description: string }[];
};

const orders: Order[] = [
  {
    id: "MJE-1001",
    email: "sari@example.com",
    status: "Telah Diterima",
    items: [{ name: "Rice Cooker Digital 1.8L", quantity: 1, price: 549000 }],
    shippingFee: 0,
    insuranceFee: 0,
    total: 549000,
    paymentMethod: "GoPay",
    destinationCity: "Jakarta Selatan",
    courier: "SiCepat",
    trackingNumber: "SCP100100100",
    orderedAt: daysAgo(6),
    deliveredAt: daysAgo(3),
  },
  {
    id: "MJE-1002",
    email: "andi@example.com",
    status: "Dalam Pengiriman",
    items: [{ name: "Smart TV LED 43 inch", quantity: 1, price: 3499000 }],
    shippingFee: 0,
    insuranceFee: 17495,
    total: 3516495,
    paymentMethod: "Cicilan 0% BCA 6 bulan",
    destinationCity: "Bandung",
    courier: "J&T Cargo",
    trackingNumber: "JNT200200200",
    orderedAt: daysAgo(3),
  },
  {
    id: "MJE-1003",
    email: "dewi@example.com",
    status: "Telah Diterima",
    items: [{ name: "Blender 2L", quantity: 1, price: 389000 }],
    shippingFee: 0,
    insuranceFee: 0,
    total: 389000,
    paymentMethod: "Virtual Account BCA",
    destinationCity: "Depok",
    courier: "JNE",
    trackingNumber: "JNE300300300",
    orderedAt: daysAgo(13),
    deliveredAt: daysAgo(10),
  },
  {
    id: "MJE-1004",
    email: "rudi@example.com",
    status: "Menunggu Pembayaran",
    items: [{ name: "Air Fryer 4L", quantity: 1, price: 899000 }],
    shippingFee: 0,
    insuranceFee: 0,
    total: 899000,
    paymentMethod: "Virtual Account BCA",
    paymentDeadline: hoursFromNow(5),
    destinationCity: "Surabaya",
    orderedAt: daysAgo(19 / 24),
  },
  {
    id: "MJE-1005",
    email: "maya@example.com",
    status: "Sedang Dikemas",
    items: [{ name: "Setrika Uap 2000W", quantity: 1, price: 329000 }],
    shippingFee: 0,
    insuranceFee: 0,
    total: 329000,
    paymentMethod: "COD",
    destinationCity: "Tangerang",
    orderedAt: daysAgo(0.2),
  },
];

const shipments: Record<string, Shipment> = {
  SCP100100100: {
    courier: "SiCepat",
    events: [
      { time: daysAgo(5), description: "Paket diserahkan ke kurir di Cikarang" },
      { time: daysAgo(4), description: "Tiba di hub Jakarta Selatan" },
      { time: daysAgo(3), description: "Paket diterima oleh SARI" },
    ],
  },
  JNT200200200: {
    courier: "J&T Cargo",
    estimatedDelivery: hoursFromNow(36),
    events: [
      { time: daysAgo(2), description: "Paket diserahkan ke kurir di Cikarang" },
      { time: daysAgo(1.5), description: "Tiba di gudang J&T Cargo Jakarta" },
      { time: daysAgo(0.5), description: "Dalam perjalanan menuju Bandung" },
    ],
  },
  JNE300300300: {
    courier: "JNE",
    events: [
      { time: daysAgo(12), description: "Paket diserahkan ke kurir di Cikarang" },
      { time: daysAgo(11), description: "Tiba di hub Depok" },
      { time: daysAgo(10), description: "Paket diterima oleh DEWI" },
    ],
  },
};

export function findOrder(orderId: string, email: string) {
  return orders.find(
    (order) => order.id === orderId.trim().toUpperCase() && order.email === email.trim().toLowerCase(),
  );
}

export function findShipment(trackingNumber: string) {
  return shipments[trackingNumber.trim().toUpperCase()];
}

export function daysSince(isoDate: string) {
  return Math.floor((Date.now() - new Date(isoDate).getTime()) / DAY);
}
