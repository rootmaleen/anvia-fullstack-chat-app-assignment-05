// Toko Maju Elektronik mark: a teal rounded square with a white bolt and a lime spark.
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" className="shrink-0">
      <rect width="100" height="100" rx="28" fill="var(--color-brand)" />
      <path
        transform="translate(20 22) scale(2.5)"
        fill="#fff"
        d="M11 21h-1l1-7H7.5c-.88 0-.33-.75-.31-.78C8.48 10.94 10.42 7.54 13.01 3h1l-1 7h3.51c.4 0 .62.19.4.66C12.97 17.55 11 21 11 21z"
      />
      <circle cx="74" cy="26" r="8" fill="var(--color-accent)" />
    </svg>
  );
}

export function LogoLockup() {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark />
      <p className="text-[17px] font-medium tracking-[-0.01em] text-ink">
        Toko <span className="font-extrabold">Maju</span> Elektronik
      </p>
    </div>
  );
}
