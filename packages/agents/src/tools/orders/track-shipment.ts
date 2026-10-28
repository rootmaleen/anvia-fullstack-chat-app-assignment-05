import { createTool } from "@anvia/core";
import { z } from "zod";
import { findShipment } from "./data";

export const trackShipmentTool = createTool({
  name: "track_shipment",
  description: "Get the tracking history of a shipment by its tracking number (resi), from lookup_order.",
  inputSchema: z.object({
    trackingNumber: z.string().describe("Tracking number (resi), e.g. JNT200200200."),
  }),
  execute: async ({ trackingNumber }) => {
    const shipment = findShipment(trackingNumber);
    if (!shipment) return { found: false, message: "No tracking data for this number yet. Updates can take up to 24 hours." };
    return { found: true, ...shipment };
  },
});
