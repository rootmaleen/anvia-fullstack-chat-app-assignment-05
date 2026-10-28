import { OpenAIClient } from "@anvia/openai";

const OPENROUTER_BASE_URL = "https://gateway.devscale.id/v1";

export const DEFAULT_MODEL_ID = "gpt-5.6-luna";

let client: OpenAIClient | undefined;

function getClient() {
  if (!client) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("Set OPENROUTER_API_KEY.");
    client = new OpenAIClient({ apiKey, baseUrl: OPENROUTER_BASE_URL });
  }
  return client;
}

/** `modelId` is an OpenRouter canonical id, e.g. "openai/gpt-6-luna". */
export function getModel(modelId: string = DEFAULT_MODEL_ID) {
  return getClient().completionModel({ modelId, api: "chat" });
}
