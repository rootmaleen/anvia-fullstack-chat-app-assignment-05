import { createTool } from "@anvia/core";
import { z } from "zod";
import { daysSince, findOrder, RETURN_WINDOW_DAYS } from "./data";

export const createReturnRequestTool = createTool({
  name: "create_return_request",
  description:
    "Submit a return request for a delivered order. Only call this after the customer has confirmed the order, item and reason.",
  inputSchema: z.object({
    orderId: z.string().describe("Order number, e.g. MJE-1001."),
    email: z.string().describe("Email address used for the order."),
    reason: z.enum(["damaged", "defective", "wrong_item", "change_of_mind"]),
    description: z.string().min(5).describe("What is wrong, in the customer's words."),
  }),
  execute: async ({ orderId, email, reason }) => {
    const order = findOrder(orderId, email);
    if (!order) return { created: false, message: "No order matches this order number and email." };
    if (!order.deliveredAt) return { created: false, message: `Only delivered orders can be returned. Status: ${order.status}.` };

    const days = daysSince(order.deliveredAt);
    if (days > RETURN_WINDOW_DAYS) {
      return {
        created: false,
        message: `The ${RETURN_WINDOW_DAYS}-day return period has passed (delivered ${days} days ago). Defects are handled by the warranty.`,
      };
    }

    // Mock: a real implementation would save the request.
    return {
      created: true,
      requestId: `RET-${order.id.slice(4)}-${String(Date.now()).slice(-4)}`,
      freeReturnShipping: reason !== "change_of_mind",
      nextSteps: "Customer service reviews the request within 1 working day, then arranges the pickup or return.",
    };
  },
});
