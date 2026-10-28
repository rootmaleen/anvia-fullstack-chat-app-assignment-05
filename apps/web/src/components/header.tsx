import { LogoLockup, LogoMark } from "./logo";

export function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-line px-3 md:h-16 md:justify-start md:gap-4 md:px-8">
      <button
        type="button"
        aria-label="Open menu"
        onClick={onOpenMenu}
        className="flex size-10 items-center justify-center rounded-[10px] text-ink hover:bg-hover md:hidden"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile: mark with stacked titles. */}
      <div className="flex items-center gap-2.5 md:hidden">
        <LogoMark />
        <div>
          <p className="text-sm font-bold text-ink">Toko Maju Elektronik</p>
          <p className="text-[11px] text-ink-muted">Customer Support</p>
        </div>
      </div>
      <div className="size-10 md:hidden" />

      {/* Desktop: lockup, divider, title. */}
      <div className="hidden items-center gap-4 md:flex">
        <LogoLockup />
        <span className="h-5 w-px bg-line" />
        <p className="text-sm font-medium text-ink-muted">Customer Support</p>
      </div>
    </header>
  );
}
