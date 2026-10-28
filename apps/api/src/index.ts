import { runAgent } from "@anvia/agents";
import { agentToClientStream, parseClientStreamRequest } from "@anvia/client";
import { db } from "@anvia/db";
import { PrismaMemoryStore } from "@anvia/memory-prisma/v8";
import { createClientStreamResponse } from "@anvia/server";
import { serve } from "@hono/node-server";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";

const memoryStore = new PrismaMemoryStore({ client: db });

// No auth yet: every session belongs to this user.
const USER_ID = "default-user";

const app = new Hono();

app.use("/*", cors());

app.get("/", (c) => c.json({ status: "ok" }));

const helloSchema = z.object({
  name: z.string().min(1),
});

app.post("/hello", zValidator("json", helloSchema), (c) => {
  const { name } = c.req.valid("json");
  return c.json({ message: `Hello, ${name}!` });
});

app.get("/api/sessions", async (c) => {
  const conversations = (await memoryStore.inspector?.listConversations({ limit: 50, userId: USER_ID })) ?? [];
  const sessions = await Promise.all(
    conversations.map(async ({ sessionId, updatedAt }) => {
      const messages = await memoryStore.load({ scope: { sessionId, userId: USER_ID } });
      const first = messages.find((message) => message.role === "user");
      // Content is a plain string or a list of parts (what the web client sends).
      const text =
        typeof first?.content === "string"
          ? first.content
          : (first?.content ?? []).map((part) => (part.type === "text" ? part.text : "")).join(" ");
      const title = text.trim() || "New chat";
      return { id: sessionId, title, updatedAt };
    }),
  );
  return c.json(sessions);
});

app.get("/api/chat/:sessionId", async (c) => {
  const messages = await memoryStore.load({ scope: { sessionId: c.req.param("sessionId"), userId: USER_ID } });
  return c.json(messages);
});

app.post("/api/chat", async (c) => {
  const body = parseClientStreamRequest(await c.req.json());
  if (body.type !== "messages") return c.text("This endpoint accepts messages only.", 400);

  const sessionId = c.req.header("x-session-id");
  if (!sessionId) return c.text("Missing x-session-id header.", 400);

  const stream = runAgent({
    messages: body.messages,
    abortSignal: c.req.raw.signal,
    memory: { store: memoryStore, session: { sessionId, userId: USER_ID } },
  });
  return createClientStreamResponse({ events: agentToClientStream({ events: stream }) });
});

const port = Number(process.env.PORT ?? 3000);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`API running on http://localhost:${info.port}`);
});

export type AppType = typeof app;
