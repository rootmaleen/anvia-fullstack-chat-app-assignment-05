// Styles shared by the new-chat form and the session composer, so both look the same.

export const composerClassName =
  "flex flex-col gap-2 rounded-3xl border border-line bg-sidebar pt-4 pr-4 pb-3 pl-5 transition focus-within:border-accent focus-within:bg-white focus-within:shadow-[0_0_0_1px_var(--color-accent),0_0_10px_#edf06099]";

export const composerInputClassName =
  "max-h-48 w-full resize-none overflow-y-auto bg-transparent text-[15px] leading-normal text-ink outline-none placeholder:text-ink-muted [&_[contenteditable]]:outline-none";

export const sendButtonClassName =
  "flex size-9 items-center justify-center rounded-full bg-ink text-white transition hover:bg-accent hover:text-ink disabled:bg-disabled disabled:text-white";

export const composerPlaceholder = "Tanya soal pesanan, pengiriman, retur, garansi…";

export function SendIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}

export function StopIcon() {
  return <span className="size-3 rounded-[3px] bg-current" aria-hidden="true" />;
}

export function Disclaimer() {
  return (
    <p className="text-center text-xs leading-normal text-ink-muted">
      Asisten AI bisa keliru. Untuk hal penting, hubungi CS kami di WhatsApp +62 812-0000-1234.
    </p>
  );
}
