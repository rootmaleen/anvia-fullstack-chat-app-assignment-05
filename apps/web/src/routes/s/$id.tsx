import { createHttpClientTransport, type UIMessage } from "@anvia/client";
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

// Saved messages carry metadata.createdAt from the API. A message that just arrived has none yet,
// so it uses the moment it first appeared. After a reload, the saved time is used.
const firstSeen = new Map<string, string>();

function messageTime(message: UIMessage) {
  const createdAt = message.metadata?.createdAt;
  if (typeof createdAt === "string") return createdAt;
  if (!firstSeen.has(message.id)) firstSeen.set(message.id, new Date().toISOString());
  return firstSeen.get(message.id)!;
}

const hasText = (message: UIMessage) => message.parts.some((part) => part.type === "text");

const dateFormat = new Intl.DateTimeFormat("id-ID", { dateStyle: "full" });
const timeFormat = new Intl.DateTimeFormat("id-ID", { timeStyle: "short" });
const formatDate = (iso: string) => dateFormat.format(new Date(iso));
const formatTime = (iso: string) => timeFormat.format(new Date(iso));
const sameDay = (a: string, b: string) => new Date(a).toDateString() === new Date(b).toDateString();

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
  // A date divider goes above the first visible message, and above the first message of each new day.
  function startsNewDay(message: UIMessage) {
    if (!hasText(message)) return false;
    const visible = chat.messages.filter(hasText);
    const previous = visible[visible.findIndex((m) => m.id === message.id) - 1];
    return !previous || !sameDay(messageTime(previous), messageTime(message));
  }

  // "error" is not running: show the send button again so the user can retry.
  const isRunning = chat.status === "submitted" || chat.status === "streaming";

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
        <header className="px-4 py-3 text-lg font-semibold">Toko Maju Elektronik · Customer Support</header>

        <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto">
          <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6">
            <ThreadPrimitive.Messages>
              <MessagePrimitive.Root className="group flex flex-col items-start gap-1 data-[role=user]:items-end">
                {(message) => (
                  <>
                    {startsNewDay(message) && (
                      <p className="self-stretch py-2 text-center text-xs font-medium text-gray-400">
                        {formatDate(messageTime(message))}
                      </p>
                    )}
                    <MessagePrimitive.Content className="max-w-full group-data-[role=user]:max-w-[70%] group-data-[role=user]:rounded-3xl group-data-[role=user]:bg-[#303030] group-data-[role=user]:px-5 group-data-[role=user]:py-2.5">
                      <MessagePrimitive.Parts filter={(part) => part.type === "text"}>
                        {() => <MessagePrimitive.Markdown className="markdown" />}
                      </MessagePrimitive.Parts>
                    </MessagePrimitive.Content>
                    {hasText(message) && (
                      <time className="px-1 text-xs text-gray-500">{formatTime(messageTime(message))}</time>
                    )}
                  </>
                )}
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
              placeholder="Tanya soal pesanan, pengiriman, retur, garansi…"
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
            Asisten AI bisa keliru. Untuk hal penting, hubungi CS kami di WhatsApp +62 812-0000-1234.
          </p>
        </div>
      </ThreadPrimitive.Root>
    </ChatProvider>
  );
}
