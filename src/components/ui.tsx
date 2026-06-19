import { type ReactNode } from "react";
import { displayDepartmentAbbr, getDepartmentLogoUrl } from "@/lib/departmentLogos";

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
  logoUrl,
}: {
  abbr: string | null;
  color?: string | null;
  name?: string | null;
  logoUrl?: string | null;
}) {
  const resolvedLogo = getDepartmentLogoUrl(abbr, logoUrl);
  const displayAbbr = displayDepartmentAbbr(abbr);

  return (
    <span className="inline-flex items-center gap-2" title={name ?? abbr ?? ""}>
      <span
        className="grid h-8 w-8 place-items-center overflow-hidden rounded-lg bg-white text-[10px] font-bold text-white ring-1 ring-white/20"
        style={{ backgroundColor: resolvedLogo ? "#fff" : (color ?? "rgb(var(--c-primary))") }}
        aria-hidden
      >
        {resolvedLogo ? (
          <img src={resolvedLogo} alt="" className="h-full w-full object-contain p-0.5" decoding="async" />
        ) : (
          displayAbbr.slice(0, 3)
        )}
      </span>
      <span className="font-semibold">{displayAbbr}</span>
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
  homeLogo,
  awayLogo,
  center = "vs",
  centerClassName = "text-xs font-bold uppercase text-white/42",
  layout = "inline",
}: {
  home: string | null;
  away: string | null;
  homeColor?: string | null;
  awayColor?: string | null;
  homeName?: string | null;
  awayName?: string | null;
  homeLogo?: string | null;
  awayLogo?: string | null;
  center?: ReactNode;
  centerClassName?: string;
  layout?: "inline" | "stacked";
}) {
  if (layout === "stacked") {
    return (
      <div className="grid w-full grid-cols-[minmax(0,1fr)_3.25rem_minmax(0,1fr)] items-center gap-2 sm:gap-4">
        <TeamStack abbr={home} color={homeColor} name={homeName} logoUrl={homeLogo} align="left" />
        <span className={`justify-self-center text-center ${centerClassName}`}>
          {center}
        </span>
        <TeamStack abbr={away} color={awayColor} name={awayName} logoUrl={awayLogo} align="right" />
      </div>
    );
  }

  return (
    <div className="grid w-full grid-cols-[minmax(0,1fr)_3rem_minmax(0,1fr)] items-center gap-2 sm:gap-4">
      <div className="min-w-0 justify-self-start">
        <DepartmentBadge abbr={home} color={homeColor} name={homeName} logoUrl={homeLogo} />
      </div>
      <span className={`justify-self-center text-center ${centerClassName}`}>
        {center}
      </span>
      <div className="min-w-0 justify-self-end text-right">
        <DepartmentBadge abbr={away} color={awayColor} name={awayName} logoUrl={awayLogo} />
      </div>
    </div>
  );
}

function TeamStack({
  abbr,
  color,
  name,
  logoUrl,
  align,
}: {
  abbr: string | null;
  color?: string | null;
  name?: string | null;
  logoUrl?: string | null;
  align: "left" | "right";
}) {
  const resolvedLogo = getDepartmentLogoUrl(abbr, logoUrl);
  const displayAbbr = displayDepartmentAbbr(abbr);

  return (
    <span
      className={`flex min-w-0 flex-col gap-1.5 ${align === "right" ? "items-end text-right" : "items-start text-left"}`}
      title={name ?? abbr ?? ""}
    >
      <span
        className="grid h-11 w-11 place-items-center overflow-hidden rounded-xl bg-white text-[10px] font-bold text-white ring-1 ring-white/20 sm:h-12 sm:w-12"
        style={{ backgroundColor: resolvedLogo ? "#fff" : (color ?? "rgb(var(--c-primary))") }}
        aria-hidden
      >
        {resolvedLogo ? (
          <img src={resolvedLogo} alt="" className="h-full w-full object-contain p-1" decoding="async" />
        ) : (
          displayAbbr.slice(0, 3)
        )}
      </span>
      <span className="max-w-full truncate font-display text-lg font-bold uppercase leading-none tracking-normal text-white sm:text-xl">
        {displayAbbr}
      </span>
    </span>
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
