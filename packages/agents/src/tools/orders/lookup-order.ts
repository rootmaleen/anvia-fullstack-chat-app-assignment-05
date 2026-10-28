import { createTool } from "@anvia/core";
import { z } from "zod";
import { daysSince, findOrder, RETURN_WINDOW_DAYS } from "./data";

export const lookupOrderTool = createTool({
  name: "lookup_order",
  description:
    "Look up a customer's order by order number and the email used for the order. Returns status, items, totals, payment, courier and tracking number.",
  inputSchema: z.object({
    orderId: z.string().describe("Order number, e.g. MJE-1001."),
    email: z.string().describe("Email address used for the order."),
  }),
  execute: async ({ orderId, email }) => {
    const order = findOrder(orderId, email);
    // Same answer for a wrong number or a wrong email, so order details never leak.
    if (!order) return { found: false, message: "No order matches this order number and email." };

    const { email: _email, ...details } = order;
    // Tool output must be strict JSON, so no undefined fields.
    if (!order.deliveredAt) return { found: true, order: details };

    const daysSinceDelivered = daysSince(order.deliveredAt);
    return {
      found: true,
      order: details,
      daysSinceDelivered,
      returnWindowOpen: daysSinceDelivered <= RETURN_WINDOW_DAYS,
    };
  },
});
