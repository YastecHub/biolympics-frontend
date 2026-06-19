import { Link } from "react-router-dom";
import type { Fixture } from "@/types";
import { LIVE_STATUSES } from "@/types";
import { displayDepartmentAbbr, getDepartmentLogoUrl } from "@/lib/departmentLogos";
import { formatDateTime, timeAgo } from "@/lib/time";
import { LiveBadge } from "./ui";

function FixtureTeam({
  team,
  align,
  won,
}: {
  team: Fixture["home"];
  align: "left" | "right";
  won: boolean;
}) {
  const abbr = team?.department_abbr ?? null;
  const logo = getDepartmentLogoUrl(abbr, team?.logo_url);
  const displayAbbr = displayDepartmentAbbr(abbr);

  return (
    <div
      className={`flex min-w-0 flex-col gap-1.5 ${align === "right" ? "items-end text-right" : "items-start text-left"} ${
        won ? "text-white" : "text-white/82"
      }`}
      title={team?.department_name ?? displayAbbr}
    >
      <span
        className="grid h-11 w-11 place-items-center overflow-hidden rounded-xl bg-white text-[10px] font-black text-white ring-1 ring-white/20"
        style={{ backgroundColor: logo ? "#fff" : (team?.primary_color ?? "rgb(var(--c-primary))") }}
        aria-hidden
      >
        {logo ? (
          <img src={logo} alt="" className="h-full w-full object-contain p-1" decoding="async" />
        ) : (
          displayAbbr.slice(0, 3)
        )}
      </span>
      <span className="max-w-full truncate font-display text-lg font-bold uppercase leading-none tracking-normal">
        {displayAbbr}
      </span>
    </div>
  );
}

export function MatchCard({ fx }: { fx: Fixture }) {
  const isLive = LIVE_STATUSES.includes(fx.status);
  const isDone = fx.status === "COMPLETED" || fx.status === "WALKOVER";
  const live = fx.live;

  const homeScore = live ? live.home_score : undefined;
  const awayScore = live ? live.away_score : undefined;
  const homeWon = isDone && (homeScore ?? 0) > (awayScore ?? 0);
  const awayWon = isDone && (awayScore ?? 0) > (homeScore ?? 0);

  // For announcements/screen-readers: a concise score summary.
  const srLabel = `${displayDepartmentAbbr(fx.home?.department_abbr)} ${homeScore ?? ""} ${
    displayDepartmentAbbr(fx.away?.department_abbr)
  } ${awayScore ?? ""} ${fx.status}`;
  const centerLabel = live ? (
    <span className="flex items-center justify-center gap-1 font-display text-2xl font-bold tabular-nums text-white">
      <span>{homeScore}</span>
      <span className="text-white/35">-</span>
      <span>{awayScore}</span>
    </span>
  ) : (
    <span className="rounded-full bg-white/10 px-3 py-1 font-display text-lg font-bold uppercase text-white">vs</span>
  );

  return (
    <Link
      to={`/fixtures/${fx.id}`}
      className="card block p-4 transition hover:ring-brand-primary/40"
      aria-label={srLabel}
    >
      <div className="mb-2 flex items-center justify-between text-xs text-muted">
        <span className="font-semibold uppercase tracking-wide">{fx.sport_name}</span>
        {isLive ? <LiveBadge /> : <span>{fx.round_name ?? fx.group_name ?? ""}</span>}
      </div>

      {fx.home || fx.away ? (
        <div className="grid grid-cols-[minmax(0,1fr)_4rem_minmax(0,1fr)] items-center gap-2">
          <FixtureTeam team={fx.home} align="left" won={homeWon} />
          <span className="justify-self-center text-center">{centerLabel}</span>
          <FixtureTeam team={fx.away} align="right" won={awayWon} />
        </div>
      ) : (
        <p className="py-2 font-semibold text-muted">
          {fx.round_name ?? "Fixture"} — participants TBD
        </p>
      )}

      <div className="mt-3 flex items-center justify-between text-xs text-muted">
        <span>
          {isLive
            ? (live?.clock_text ?? live?.period ?? "In progress")
            : isDone
              ? "Full time"
              : formatDateTime(fx.scheduled_start)}
        </span>
        <span>
          {fx.venue_tbd ? "Venue TBD" : fx.venue_name}
          {isLive && live?.last_updated_at ? ` · ${timeAgo(live.last_updated_at)}` : ""}
        </span>
      </div>
    </Link>
  );
}
