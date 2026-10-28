import { Link } from "@tanstack/react-router";

export type SessionSummary = { id: string; title: string; updatedAt: string };

export function Sidebar({ sessions }: { sessions: SessionSummary[] }) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-[#171717] p-3 md:flex">
      <Link to="/" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-white/10">
        <span className="text-lg leading-none">+</span> New chat
      </Link>

      <p className="mt-6 px-3 text-xs font-medium text-gray-400">Chats</p>
      <nav className="mt-1 flex flex-1 flex-col gap-0.5 overflow-y-auto">
        {sessions.length === 0 && <p className="px-3 py-2 text-sm text-gray-500">No chats yet</p>}
        {sessions.map((session) => (
          <Link
            key={session.id}
            to="/s/$id"
            params={{ id: session.id }}
            className="truncate rounded-lg px-3 py-2 text-sm hover:bg-white/10"
            activeProps={{ className: "bg-white/10" }}
          >
            {session.title}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3 rounded-lg px-3 py-2">
        <div className="flex size-8 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white">
          DU
        </div>
        <div className="text-sm">
          <p className="font-medium">default-user</p>
          <p className="text-xs text-gray-400">PT Maju Jaya Sakti</p>
        </div>
      </div>
    </aside>
  );
}
