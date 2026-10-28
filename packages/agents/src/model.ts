import { OpenAIClient } from "@anvia/openai";

const OPENAI_BASE_URL = "https://gateway.devscale.id/v1";

export const DEFAULT_MODEL_ID = "gpt-5.6-luna";

let client: OpenAIClient | undefined;

function getClient() {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("Set OPENAI_API_KEY.");
    client = new OpenAIClient({ apiKey, baseUrl: OPENAI_BASE_URL });
  }
  return client;
}

/** `modelId` is a model id the gateway serves, e.g. "gpt-5.6-luna". */
export function getModel(modelId: string = DEFAULT_MODEL_ID) {
  return getClient().completionModel({ modelId, api: "chat" });
}
