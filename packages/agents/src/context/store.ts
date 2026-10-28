import type { Document } from "@anvia/core";

// Mock data for Toko Maju Elektronik. Replace with the real store policies.

const SOURCE = "mock";

export const storeProfileDocument: Document = {
  id: "store-profile",
  text: `Toko Maju Elektronik is an online store for home electronics and household appliances in Indonesia, run by PT Maju Jaya Sakti.
- Categories: kitchen appliances (rice cooker, blender, air fryer), home appliances (setrika, kipas angin, vacuum cleaner), TV and audio, large appliances (AC, kulkas, mesin cuci).
- All orders ship from the warehouse in Cikarang, Kabupaten Bekasi.
- Customer service (human): every day 08:00-21:00 WIB. WhatsApp +62 812-0000-1234, email cs@majuelektronik.co.id, or the chat in the app.
- Order numbers look like MJE-1001.`,
  additionalProps: { title: "Store profile", source: SOURCE },
};

export const ordersDocument: Document = {
  id: "policy-orders",
  text: `Orders and cancellation.
Order statuses: Menunggu Pembayaran (awaiting payment) -> Sedang Dikemas (being packed) -> Dalam Pengiriman (shipped) -> Telah Diterima (delivered).
- Customers can cancel for free in the app (Pesanan Saya -> Batalkan) while the status is Menunggu Pembayaran or Sedang Dikemas.
- Once the order is Dalam Pengiriman it can no longer be cancelled. The customer can refuse the delivery, or return the item after receiving it under the return policy.
- Paid orders that are cancelled are refunded in full, with the same refund times as returns.
- The delivery address can only be changed before payment. After payment, the customer must cancel and order again.
- The support assistant cannot cancel orders, change addresses or issue refunds itself. It explains how the customer does it, or refers to human customer service.`,
  additionalProps: { title: "Orders and cancellation", source: SOURCE },
};

export const shippingDocument: Document = {
  id: "policy-shipping",
  text: `Shipping.
Couriers: JNE, J&T, SiCepat, Anteraja. Instant couriers (GoSend, Grab Express) only within Jabodetabek. Large appliances (AC, kulkas, mesin cuci, TV 43 inch and larger) ship by cargo (J&T Cargo, JNE Trucking).

Processing
- Orders paid before 15:00 WIB on a working day are packed and handed to the courier the same day. Later orders, and orders on weekends or public holidays, are handed over the next working day.
- With an instant courier, Jabodetabek orders paid before 15:00 WIB arrive the same day.

Delivery time after handover to the courier (working days)
- Jabodetabek: 1-2 days.
- Rest of Java: 2-4 days.
- Outside Java: 4-10 days.
- Cargo (large appliances): 3-7 days in Java, 7-14 days outside Java.

Free shipping (ongkir)
- Jabodetabek: free for orders of at least Rp300.000.
- Rest of Java: free for orders of at least Rp500.000.
- Outside Java: no free shipping. The courier rate is shown at checkout.

Shipping insurance
- Required for orders with an item value of Rp1.000.000 or more. The fee is 0.5% of the item value. Optional for smaller orders.
- Example: TV Rp3.499.000 -> insurance 0.5% x 3.499.000 = Rp17.495.

Tracking and lost packages
- The tracking number (resi) is sent by email and shown in the app after handover. Tracking updates can take up to 24 hours to appear.
- If tracking shows no progress for 5 working days after the estimated delivery date, contact customer service. We file a claim with the courier and send a replacement or a full refund within 7 working days.`,
  additionalProps: { title: "Shipping", source: SOURCE },
};

export const paymentDocument: Document = {
  id: "policy-payment",
  text: `Payment.
Methods: virtual account (BCA, Mandiri, BNI, BRI), e-wallet (GoPay, OVO, DANA, ShopeePay), QRIS, credit or debit card (Visa, Mastercard), 0% installment, and COD.

Payment deadline (unpaid orders are cancelled automatically)
- Virtual account and QRIS: 24 hours after ordering.
- E-wallet: 1 hour.
- Card: paid at checkout.

COD (bayar di tempat)
- Only in Jabodetabek and the rest of Java.
- Maximum order value Rp2.000.000.
- COD fee Rp5.000 per order.

0% installment (cicilan 0%)
- Credit cards from BCA, Mandiri and BNI.
- Minimum purchase Rp1.500.000.
- Tenors: 3, 6 or 12 months.`,
  additionalProps: { title: "Payment", source: SOURCE },
};

export const returnsDocument: Document = {
  id: "policy-returns",
  text: `Returns and refunds.
Return period: 7 calendar days after the order status becomes Telah Diterima (delivered).

Damaged, defective or wrong item
- Damaged on arrival or wrong/missing item: report in the app within 2 x 24 hours (48 hours) after receiving it, with an unboxing video (one continuous video starting from the sealed package) and photos.
- Defective (does not work properly): report within the 7-day return period.
- Return shipping is free (the courier picks it up).
- Remedy: a replacement if in stock, or a full refund including the original shipping fee.

Change of mind
- Accepted within 7 days only if the product is unopened (seal intact), unused and in its original box with all accessories.
- The customer pays the return shipping. The original shipping fee is not refunded.

Not returnable
- Opened or used items that are not defective.
- Items with missing accessories or packaging.
- Requests after the 7-day return period. After that, defects are handled by the warranty.

Process
1. The customer submits a return request (in the app or through the support assistant).
2. Customer service reviews it within 1 working day.
3. The item is picked up or sent back to the warehouse.
4. The warehouse inspects it within 2 working days after receiving it.
5. The refund is processed after the inspection is approved.

Refund time after approval (working days)
- E-wallet: 1-3 days.
- Bank transfer or virtual account: 3-5 days.
- Credit card: 7-14 days (depends on the bank).
- COD orders: refunded by bank transfer to the customer's account, 3-5 days.
- The refund equals the amount actually paid. Voucher discounts are not refunded as cash.`,
  additionalProps: { title: "Returns and refunds", source: SOURCE },
};

export const warrantyDocument: Document = {
  id: "policy-warranty",
  text: `Warranty (garansi resmi Toko Maju Elektronik). The warranty starts on the delivery date.
- Small appliances (rice cooker, blender, air fryer, setrika, kipas angin, vacuum cleaner): 1 year.
- Large appliances (AC, kulkas, mesin cuci) and TVs: 2 years.
- Accessories and batteries: 3 months.

Not covered: physical damage (dropped, cracked), liquid damage, damage from power surges or unstable voltage, repairs by unauthorised technicians, normal wear, and misuse.

How to claim
- Contact customer service or use the app, with the order number, the product serial number, and a photo or video of the problem.
- The service centre diagnoses the product. Repair takes 7-14 working days.
- If the product cannot be repaired, it is replaced with the same or an equivalent product.
- Problems found within the first 7 days after delivery go through the return policy instead.`,
  additionalProps: { title: "Warranty", source: SOURCE },
};

export const vouchersDocument: Document = {
  id: "policy-vouchers",
  text: `Vouchers and promotions.
- Welcome voucher for new customers: Rp50.000 off, minimum purchase Rp500.000, valid for 30 days after registering, one use only.
- One discount voucher per order. A discount voucher can be combined with free shipping, but not with another discount voucher.
- Vouchers cannot be exchanged for cash.
- If an order is cancelled before it ships, the voucher is returned if it has not expired. Vouchers are not returned for orders that are returned after delivery.
- The assistant has no access to live prices, stock or promo schedules. For those, the customer should check the product page in the app.`,
  additionalProps: { title: "Vouchers and promotions", source: SOURCE },
};

export const storeDocuments: Document[] = [
  storeProfileDocument,
  ordersDocument,
  shippingDocument,
  paymentDocument,
  returnsDocument,
  warrantyDocument,
  vouchersDocument,
];
