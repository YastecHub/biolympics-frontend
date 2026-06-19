import { type ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="card grid place-items-center gap-1 px-6 py-12 text-center">
      <p className="text-lg font-semibold">{title}</p>
      {hint && <p className="text-sm text-muted">{hint}</p>}
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="card grid place-items-center gap-3 px-6 py-12 text-center">
      <p className="text-lg font-semibold">We couldn&apos;t load that.</p>
      <p className="text-sm text-muted">
        Check your connection — your saved data may be out of date.
      </p>
      {onRetry && (
        <button className="btn-primary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function LiveBadge() {
  return (
    <span className="chip bg-danger/15 text-danger">
      <span className="h-2 w-2 animate-pulse-live rounded-full bg-danger" aria-hidden />
      LIVE
    </span>
  );
}

export function DepartmentBadge({
  abbr,
  color,
  name,
}: {
  abbr: string | null;
  color?: string | null;
  name?: string | null;
}) {
  return (
    <span className="inline-flex items-center gap-2" title={name ?? abbr ?? ""}>
      <span
        className="grid h-7 w-7 place-items-center rounded-lg text-[10px] font-bold text-white"
        style={{ backgroundColor: color ?? "rgb(var(--c-primary))" }}
        aria-hidden
      >
        {(abbr ?? "?").slice(0, 3)}
      </span>
      <span className="font-semibold">{abbr ?? "TBD"}</span>
    </span>
  );
}

export function MatchupTeams({
  home,
  away,
  homeColor,
  awayColor,
  homeName,
  awayName,
  center = "vs",
  centerClassName = "text-xs font-bold uppercase text-white/42",
}: {
  home: string | null;
  away: string | null;
  homeColor?: string | null;
  awayColor?: string | null;
  homeName?: string | null;
  awayName?: string | null;
  center?: ReactNode;
  centerClassName?: string;
}) {
  return (
    <div className="grid w-full grid-cols-[minmax(0,1fr)_3rem_minmax(0,1fr)] items-center gap-2 sm:gap-4">
      <div className="min-w-0 justify-self-start">
        <DepartmentBadge abbr={home} color={homeColor} name={homeName} />
      </div>
      <span className={`justify-self-center text-center ${centerClassName}`}>
        {center}
      </span>
      <div className="min-w-0 justify-self-end text-right">
        <DepartmentBadge abbr={away} color={awayColor} name={awayName} />
      </div>
    </div>
  );
}

export function FollowButton({
  following,
  onClick,
  label,
}: {
  following: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={following}
      className={following ? "btn-primary" : "btn-ghost"}
    >
      {following ? "★ Following" : `☆ Follow ${label}`}
    </button>
  );
}
