import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

// New chat: composer only. Sending creates a session and continues at /s/:id.
function Index() {
  const navigate = useNavigate();
  const [text, setText] = useState("");

  function submit() {
    const firstMessage = text.trim();
    if (!firstMessage) return;
    void navigate({ to: "/s/$id", params: { id: crypto.randomUUID() }, state: { firstMessage } });
  }

  return (
    <div className="flex h-full flex-col">
      <header className="px-4 py-3 text-lg font-semibold">HR Assistant</header>

      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 pb-[15vh]">
        <h1 className="text-3xl font-semibold">Ada yang bisa saya bantu?</h1>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
          className="flex w-full max-w-3xl items-end gap-2 rounded-3xl bg-[#303030] p-2 pl-5"
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
            className="max-h-48 flex-1 resize-none self-center bg-transparent py-1.5 outline-none placeholder:text-gray-400"
            placeholder="Tanya soal cuti, lembur, THR, BPJS…"
          />
          <button
            type="submit"
            aria-label="Send"
            disabled={!text.trim()}
            className="flex size-9 items-center justify-center rounded-full bg-white text-black disabled:bg-gray-500"
          >
            ↑
          </button>
        </form>
      </div>
    </div>
  );
}
