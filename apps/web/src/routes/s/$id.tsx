import { createHttpClientTransport } from "@anvia/client";
import type { Message } from "@anvia/core";
import { initialMessagesFromMemory, useChat } from "@anvia/react";
import { ChatProvider, ComposerPrimitive, MessagePrimitive, ThreadPrimitive } from "@anvia/react-ui";
import { createFileRoute, useLocation, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useRef } from "react";

export const Route = createFileRoute("/s/$id")({
  loader: async ({ params }) => {
    const response = await fetch(`/api/chat/${params.id}`);
    const messages: Message[] = await response.json();
    return initialMessagesFromMemory(messages);
  },
  // Start a fresh chat state when switching between sessions.
  remountDeps: ({ params }) => params.id,
  component: Session,
});

function Session() {
  const { id } = Route.useParams();
  const initialMessages = Route.useLoaderData();
  const firstMessage = useLocation({ select: (location) => location.state.firstMessage });
  const router = useRouter();

  const transport = useMemo(
    () => createHttpClientTransport({ endpoint: "/api/chat", headers: { "x-session-id": id } }),
    [id],
  );
  // A new session is saved as soon as the agent starts answering: refresh the sidebar then, once.
  const listedInSidebar = useRef(initialMessages.length > 0);
  const chat = useChat({
    transport,
    initialMessages,
    onEvent: (event) => {
      if (event.type !== "message_start" || listedInSidebar.current) return;
      listedInSidebar.current = true;
      void router.invalidate();
    },
  });
  const isRunning = chat.status !== "ready";

  // Send the message typed on "/" once.
  useEffect(() => {
    if (!firstMessage || initialMessages.length > 0) return;
    // The timeout survives React StrictMode's mount/unmount/mount, so the message is sent only once.
    const timer = setTimeout(() => {
      void chat.sendMessage({ text: firstMessage });
    });
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ChatProvider controller={chat}>
      <ThreadPrimitive.Root className="flex h-full flex-col">
        <header className="px-4 py-3 text-lg font-semibold">HR Assistant</header>

        <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto">
          <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6">
            <ThreadPrimitive.Messages>
              <MessagePrimitive.Root className="group flex data-[role=user]:justify-end">
                <MessagePrimitive.Content className="max-w-full group-data-[role=user]:max-w-[70%] group-data-[role=user]:rounded-3xl group-data-[role=user]:bg-[#303030] group-data-[role=user]:px-5 group-data-[role=user]:py-2.5">
                  <MessagePrimitive.Parts filter={(part) => part.type === "text"}>
                    {() => <MessagePrimitive.Markdown className="markdown" />}
                  </MessagePrimitive.Parts>
                </MessagePrimitive.Content>
              </MessagePrimitive.Root>
            </ThreadPrimitive.Messages>

            {isRunning && <p className="animate-pulse text-sm text-gray-400">Thinking…</p>}
            <ThreadPrimitive.Error className="rounded-lg bg-red-950 p-3 text-sm text-red-300" />
          </div>
        </ThreadPrimitive.Viewport>

        <div className="mx-auto w-full max-w-3xl px-4 pb-4">
          <ComposerPrimitive.Root className="flex items-end gap-2 rounded-3xl bg-[#303030] p-2 pl-5">
            <ComposerPrimitive.Input
              className="max-h-48 flex-1 resize-none self-center bg-transparent py-1.5 outline-none placeholder:text-gray-400"
              placeholder="Tanya soal cuti, lembur, THR, BPJS…"
            />
            {isRunning ? (
              <ComposerPrimitive.Stop
                aria-label="Stop"
                className="flex size-9 items-center justify-center rounded-full bg-white text-black"
              >
                <span className="size-3 rounded-sm bg-black" />
              </ComposerPrimitive.Stop>
            ) : (
              <ComposerPrimitive.Submit
                aria-label="Send"
                className="flex size-9 items-center justify-center rounded-full bg-white text-black disabled:bg-gray-500"
              >
                ↑
              </ComposerPrimitive.Submit>
            )}
          </ComposerPrimitive.Root>
          <p className="mt-2 text-center text-xs text-gray-400">
            HR Assistant can make mistakes. Check important info with the HR team.
          </p>
        </div>
      </ThreadPrimitive.Root>
    </ChatProvider>
  );
}
