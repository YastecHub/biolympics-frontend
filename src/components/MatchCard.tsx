import { Link } from "react-router-dom";
import type { Fixture } from "@/types";
import { LIVE_STATUSES } from "@/types";
import { formatDateTime, timeAgo } from "@/lib/time";
import { DepartmentBadge, LiveBadge } from "./ui";

function Side({ team, score }: { team: Fixture["home"]; score?: number }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <DepartmentBadge
        abbr={team?.department_abbr ?? null}
        color={team?.primary_color}
        name={team?.department_name}
        logoUrl={team?.logo_url}
      />
      {score != null && (
        <span className="font-display text-2xl font-bold tabular-nums">{score}</span>
      )}
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
  const srLabel = `${fx.home?.department_abbr ?? "?"} ${homeScore ?? ""} ${
    fx.away?.department_abbr ?? "?"
  } ${awayScore ?? ""} ${fx.status}`;

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
        <div className="space-y-1">
          <div className={homeWon ? "font-bold" : ""}>
            <Side team={fx.home} score={homeScore} />
          </div>
          <div className={awayWon ? "font-bold" : ""}>
            <Side team={fx.away} score={awayScore} />
          </div>
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
