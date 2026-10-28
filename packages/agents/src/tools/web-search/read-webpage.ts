import { createTool } from "@anvia/core";
import { z } from "zod";
import { getTavilyClient } from "./client";

export const readWebpageTool = createTool({
  name: "read_webpage",
  description: "Read the full content of one or more webpages as markdown.",
  inputSchema: z.object({
    urls: z.array(z.url()).min(1).max(5).describe("The URLs of the webpages to read."),
  }),
  execute: async ({ urls }) => {
    const response = await getTavilyClient().extract(urls, { format: "markdown" });
    return {
      pages: response.results.map(({ url, title, rawContent }) => ({ url, title, content: rawContent })),
      failed: response.failedResults,
    };
  },
});
