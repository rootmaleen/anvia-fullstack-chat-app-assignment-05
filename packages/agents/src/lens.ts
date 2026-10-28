import { LensClient } from "@anvia/lens";

// Reads ANVIA_LENS_BASE_URL, ANVIA_LENS_PUBLIC_KEY and ANVIA_LENS_SECRET_KEY from the environment.
// `optional` turns tracing off instead of throwing when they are not set.
export const lens = new LensClient({
  serviceName: "anvia-hr-agent",
  optional: true,
});

// "full" captures prompts and responses so traces are useful for debugging. Use "safe" to omit them.
export const lensObserver = lens.observer({ captureMode: "full" });
