type Variant = "mark" | "full";

const LOGO_SRC = "/assets/ullssa-logo-mark.png";

export function Logo({
  variant = "full",
  size = 40,
  className = "",
}: {
  variant?: Variant;
  size?: number;
  className?: string;
}) {
  const mark = (
    <img
      src={LOGO_SRC}
      alt="ULLSSA"
      width={size}
      height={size}
      className="shrink-0 rounded-full object-contain"
      style={{ width: size, height: size }}
    />
  );

  if (variant === "mark") {
    return <span className={`inline-flex rounded-full bg-white p-0.5 ${className}`}>{mark}</span>;
  }

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span className="rounded-full bg-white p-0.5">{mark}</span>
      <span className="font-display font-bold leading-none tracking-tight">
        <span className="block text-2xl sm:text-3xl">
          ULLSSA <span className="text-brand-accent">BIOLYMPICS</span>
        </span>
        <span className="block text-[10px] font-semibold uppercase tracking-[0.28em] text-white/70 sm:text-xs">
          Life Sciences Dean&apos;s Games
        </span>
      </span>
    </span>
  );
}
