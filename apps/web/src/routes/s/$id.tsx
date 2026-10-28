import { createHttpClientTransport, type UIMessage } from "@anvia/client";
import type { Message } from "@anvia/core";
import { initialMessagesFromMemory, useChat } from "@anvia/react";
import { ChatProvider, ComposerPrimitive, MessagePrimitive, ThreadPrimitive } from "@anvia/react-ui";
import { createFileRoute, useLocation, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useRef } from "react";
import {
  composerClassName,
  composerInputClassName,
  composerPlaceholder,
  Disclaimer,
  SendIcon,
  sendButtonClassName,
  StopIcon,
} from "../../components/composer";
import { LogoMark } from "../../components/logo";

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
      <ThreadPrimitive.Root className="flex min-h-0 flex-1 flex-col">
        <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto">
          <div className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-5 md:gap-7 md:py-10">
            <ThreadPrimitive.Messages className="flex flex-col gap-5 md:gap-7">
              <MessagePrimitive.Root className="flex flex-col gap-5 empty:hidden md:gap-7">
                {(message) => (
                  <>
                    {startsNewDay(message) && (
                      <div className="flex items-center gap-4">
                        <span className="h-px flex-1 bg-line" />
                        <p className="text-xs font-medium text-ink-muted">{formatDate(messageTime(message))}</p>
                        <span className="h-px flex-1 bg-line" />
                      </div>
                    )}
                    {message.role === "user" ? (
                      <div className="flex flex-col items-end gap-1.5">
                        <MessagePrimitive.Content className="max-w-[70%] rounded-[20px] rounded-br-md bg-brand px-4 py-3 text-[15px] leading-normal text-white">
                          <MessagePrimitive.Parts filter={(part) => part.type === "text"}>
                            {() => <MessagePrimitive.Markdown className="markdown" />}
                          </MessagePrimitive.Parts>
                        </MessagePrimitive.Content>
                        {hasText(message) && <Timestamp message={message} />}
                      </div>
                    ) : (
                      hasText(message) && (
                        <div className="flex gap-2.5 md:gap-3">
                          <div className="pt-0.5">
                            <LogoMark size={24} />
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col gap-2">
                            <MessagePrimitive.Content className="text-[15px]">
                              <MessagePrimitive.Parts filter={(part) => part.type === "text"}>
                                {() => <MessagePrimitive.Markdown className="markdown" />}
                              </MessagePrimitive.Parts>
                            </MessagePrimitive.Content>
                            <Timestamp message={message} />
                          </div>
                        </div>
                      )
                    )}
                  </>
                )}
              </MessagePrimitive.Root>
            </ThreadPrimitive.Messages>

            <ThreadPrimitive.Loading className="flex items-center gap-3">
              <LogoMark size={24} />
              <p className="thinking text-sm font-medium">Thinking…</p>
            </ThreadPrimitive.Loading>
            <ThreadPrimitive.Error className="flex items-center gap-3 rounded-xl border border-danger-line bg-danger-bg px-4 py-3 text-sm leading-[1.45] text-danger">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              Maaf Kak, pesan belum bisa diproses. Silakan coba lagi beberapa saat lagi.
            </ThreadPrimitive.Error>
          </div>
        </ThreadPrimitive.Viewport>

        <div className="mx-auto flex w-full max-w-3xl flex-col gap-2.5 px-4 pt-2 pb-3 md:gap-3 md:pb-5">
          <ComposerPrimitive.Root className={composerClassName}>
            <ComposerPrimitive.Input className={composerInputClassName} placeholder={composerPlaceholder} />
            <div className="flex justify-end">
              {isRunning ? (
                <ComposerPrimitive.Stop aria-label="Stop" className={sendButtonClassName}>
                  <StopIcon />
                </ComposerPrimitive.Stop>
              ) : (
                <ComposerPrimitive.Submit aria-label="Send" className={sendButtonClassName}>
                  <SendIcon />
                </ComposerPrimitive.Submit>
              )}
            </div>
          </ComposerPrimitive.Root>
          <Disclaimer />
        </div>
      </ThreadPrimitive.Root>
    </ChatProvider>
  );
}

function Timestamp({ message }: { message: UIMessage }) {
  return <time className="text-xs text-ink-muted">{formatTime(messageTime(message))}</time>;
}
