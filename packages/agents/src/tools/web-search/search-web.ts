import { createTool } from "@anvia/core";
import { z } from "zod";
import { getTavilyClient } from "./client";

export const searchWebTool = createTool({
  name: "search_web",
  description:
    "Search the web for up-to-date information. Returns the top results with title, URL and a content snippet. Use read_webpage to get the full content of a result.",
  inputSchema: z.object({
    query: z.string().describe("The search query."),
    maxResults: z.number().int().min(1).max(10).default(5),
  }),
  execute: async ({ query, maxResults }) => {
    const response = await getTavilyClient().search(query, { maxResults });
    return {
      results: response.results.map(({ title, url, content }) => ({ title, url, content })),
    };
  },
});
