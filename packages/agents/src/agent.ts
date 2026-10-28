import { Agent, type AgentRunSettings, type MemoryScope, type MemoryStore, type Message } from "@anvia/core";
import { staticContext } from "./context/document";
import { BASE_INSTRUCTIONS } from "./instructions";
import { lensObserver } from "./lens";
import { getModel } from "./model";
import { createReturnRequestTool, lookupOrderTool, trackShipmentTool } from "./tools/orders";
import { readWebpageTool, searchWebTool } from "./tools/web-search";

export type RunAgentOptions = AgentRunSettings & {
  messages: readonly Message[];
  modelId?: string;
  abortSignal?: AbortSignal;
  /** Persists the conversation in `store` under `session`. Earlier turns are loaded from memory. */
  memory?: {
    store: MemoryStore;
    session: MemoryScope;
  };
};

export function createAgent(modelId?: string, memoryStore?: MemoryStore) {
  return new Agent({
    id: "support",
    model: getModel(modelId),
    instructions: BASE_INSTRUCTIONS,
    context: staticContext,
    tools: [lookupOrderTool, trackShipmentTool, createReturnRequestTool, searchWebTool, readWebpageTool],
    maxTurns: 25,
    // "message" saves the user's message right away, so a new chat is listed before the answer finishes.
    memory: memoryStore ? { store: memoryStore, savePolicy: "message" } : undefined,
    observability: {
      observers: { lens: lensObserver },
      primaryTrace: "lens",
    },
  });
}

export function runAgent({ modelId, messages, abortSignal, memory, ...settings }: RunAgentOptions) {
  const agent = createAgent(modelId, memory?.store);
  if (!memory) return agent.stream({ ...settings, messages, abortSignal });

  // With memory, history comes from the store, so only the new user message is sent.
  const prompt = messages.at(-1);
  if (prompt?.role !== "user") throw new Error("The last message must be a user message.");
  return agent.stream({ ...settings, prompt, session: memory.session, abortSignal });
}
