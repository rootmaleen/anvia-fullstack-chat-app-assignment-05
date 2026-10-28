// Live test: runs the HR agent once through runAgent() and sends the trace to Anvia Lens.
import { lens, runAgent } from "../src";

if (!lens.enabled) throw new Error("Lens is disabled. Set ANVIA_LENS_BASE_URL, ANVIA_LENS_PUBLIC_KEY and ANVIA_LENS_SECRET_KEY.");

try {
  const stream = runAgent({
    messages: [{ role: "user", content: "Berapa hari cuti tahunan yang saya dapat setelah 1 tahun bekerja?" }],
  });

  for await (const event of stream) {
    if (event.type === "text_delta") process.stdout.write(event.delta);
  }
  const outcome = await stream.result;

  console.log("\n\noutcome:", outcome.type);
  console.log("trace:", outcome.trace);
} finally {
  // Flush even when the run fails, so failed runs show up in Lens too.
  await lens.close();
  console.log("Trace flushed to", process.env.ANVIA_LENS_BASE_URL);
}
