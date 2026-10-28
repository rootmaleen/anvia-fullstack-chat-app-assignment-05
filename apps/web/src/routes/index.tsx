import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  composerClassName,
  composerInputClassName,
  composerPlaceholder,
  Disclaimer,
  SendIcon,
  sendButtonClassName,
} from "../components/composer";
import { LogoMark } from "../components/logo";

export const Route = createFileRoute("/")({
  component: Index,
});

// Starter prompts under the composer. Clicking one sends it right away. Icons are Lucide paths.
const suggestions = [
  {
    prompt: "Cek status pesanan saya",
    icon: (
      <>
        <path d="M21 8 12 3 3 8v8l9 5 9-5z" />
        <path d="m3 8 9 5 9-5M12 13v8" />
      </>
    ),
  },
  {
    prompt: "Lacak paket saya",
    icon: (
      <>
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
        <path d="M15 18H9M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
        <circle cx="17" cy="18" r="2" />
        <circle cx="7" cy="18" r="2" />
      </>
    ),
  },
  {
    prompt: "Cara retur barang rusak",
    icon: (
      <>
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
      </>
    ),
  },
  {
    prompt: "Info garansi & voucher",
    icon: (
      <>
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
  },
];

// New chat: composer only. Sending creates a session and continues at /s/:id.
function Index() {
  const navigate = useNavigate();
  const [text, setText] = useState("");

  function submit(message = text) {
    const firstMessage = message.trim();
    if (!firstMessage) return;
    void navigate({ to: "/s/$id", params: { id: crypto.randomUUID() }, state: { firstMessage } });
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 pb-[72px]">
      <div className="flex w-full max-w-3xl flex-col gap-8">
        <div className="flex flex-col items-center gap-6">
          <LogoMark size={56} />
          <h1 className="text-center text-[26px] font-bold tracking-[-0.02em] md:text-[32px]">
            Ada yang bisa kami bantu, Kak?
          </h1>
        </div>

        <div className="flex flex-col gap-3">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
            className={composerClassName}
          >
            <textarea
              rows={1}
              autoFocus
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submit();
                }
              }}
              className={composerInputClassName}
              placeholder={composerPlaceholder}
            />
            <div className="flex justify-end">
              <button type="submit" aria-label="Send" disabled={!text.trim()} className={sendButtonClassName}>
                <SendIcon />
              </button>
            </div>
          </form>

          <div className="grid grid-cols-2 gap-2 md:gap-3">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.prompt}
                type="button"
                onClick={() => submit(suggestion.prompt)}
                className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3 text-left transition hover:border-brand/30 hover:bg-sidebar"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-brand-tint text-brand">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {suggestion.icon}
                  </svg>
                </span>
                <span className="text-sm leading-snug font-medium text-ink">{suggestion.prompt}</span>
              </button>
            ))}
          </div>

          <Disclaimer />
        </div>
      </div>
    </div>
  );
}
