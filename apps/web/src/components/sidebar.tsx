import { Link } from "@tanstack/react-router";
import { LogoMark } from "./logo";

export type SessionSummary = { id: string; title: string; updatedAt: string };

// Fixed column on desktop. On mobile it is a drawer that slides in over a scrim.
export function Sidebar({
  sessions,
  open,
  onClose,
}: {
  sessions: SessionSummary[];
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-ink/40 md:hidden" onClick={onClose} />}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[310px] shrink-0 flex-col gap-4 border-r border-line bg-sidebar p-4 transition-transform md:static md:w-[260px] md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="pl-1">
          <LogoMark />
        </div>

        <Link
          to="/"
          onClick={onClose}
          className="flex h-10 items-center justify-center gap-2 rounded-xl border border-line bg-white px-3.5 text-sm font-semibold text-ink hover:bg-hover"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New chat
        </Link>

        <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto">
          <p className="px-3 pt-1 pb-1.5 text-xs font-semibold text-ink-muted">Chats</p>
          {sessions.length === 0 && <p className="px-3 py-2 text-sm text-ink-muted">No chats yet</p>}
          {sessions.map((session) => (
            <Link
              key={session.id}
              to="/s/$id"
              params={{ id: session.id }}
              onClick={onClose}
              className="flex h-10 shrink-0 items-center truncate rounded-[10px] px-3 text-sm font-medium text-ink hover:bg-hover md:h-9"
              activeProps={{ className: "bg-brand-tint font-semibold text-brand hover:bg-brand-tint" }}
            >
              <span className="truncate">{session.title}</span>
            </Link>
          ))}
        </nav>

        <div className="border-t border-line pt-3">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="flex size-9 items-center justify-center rounded-full bg-brand text-[13px] font-bold text-white">
              DU
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">default-user</p>
              <p className="text-xs text-ink-muted">Toko Maju Elektronik</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
