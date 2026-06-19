import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PageSkeleton } from "@/components/Skeletons";
import { EmptyState, ErrorState, FollowButton, LiveBadge, MatchupTeams } from "@/components/ui";
import { formatDateTime, timeAgo } from "@/lib/time";
import { useFollowStore } from "@/store";
import { LIVE_STATUSES } from "@/types";

export default function FixtureDetail() {
  const { id = "" } = useParams();
  const following = useFollowStore((s) => s.isFollowing("fixtures", id));
  const toggle = useFollowStore((s) => s.toggleFixture);

  const fx = useQuery({ queryKey: ["fixture", id], queryFn: () => api.fixture(id) });
  const events = useQuery({ queryKey: ["fixture-events", id], queryFn: () => api.fixtureEvents(id) });

  if (fx.isLoading) return <PageSkeleton />;
  if (fx.isError || !fx.data) return <ErrorState onRetry={fx.refetch} />;

  const f = fx.data;
  const isLive = LIVE_STATUSES.includes(f.status);
  const live = f.live;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-sm text-muted">
        <span className="font-semibold uppercase">{f.sport_name}</span>
        <span>{f.round_name ?? f.group_name ?? ""}</span>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between">
          {isLive ? <LiveBadge /> : <span className="chip bg-black/5 dark:bg-white/10">{f.status}</span>}
          <span className="text-xs text-muted">
            {live?.last_updated_at ? `Updated ${timeAgo(live.last_updated_at)}` : ""}
          </span>
        </div>

        <div className="my-4">
          <MatchupTeams
            home={f.home?.department_abbr ?? null}
            away={f.away?.department_abbr ?? null}
            homeColor={f.home?.primary_color}
            awayColor={f.away?.primary_color}
            homeName={f.home?.department_name}
            awayName={f.away?.department_name}
            homeLogo={f.home?.logo_url}
            awayLogo={f.away?.logo_url}
            center={live ? `${live.home_score}-${live.away_score}` : "vs"}
            centerClassName="font-display text-5xl font-bold uppercase tabular-nums text-white"
          />
        </div>

        <p className="text-center text-sm text-muted">
          {isLive
            ? (live?.clock_text ?? live?.period ?? "In progress")
            : f.time_tbd
              ? "Time TBD"
              : formatDateTime(f.scheduled_start)}
          {" - "}
          {f.venue_tbd ? "Venue TBD" : f.venue_name}
        </p>

        <div className="mt-4 flex justify-center gap-2">
          <FollowButton following={following} onClick={() => toggle(id)} label="match" />
          <button
            className="btn-ghost"
            onClick={() =>
              navigator.share?.({ title: "BIOLYMPICS LIVE", url: window.location.href }).catch(() => {})
            }
          >
            Share
          </button>
        </div>
      </div>

      <section>
        <h2 className="mb-2 font-display text-xl font-bold">Timeline</h2>
        {events.data && events.data.length > 0 ? (
          <ol className="card divide-y divide-black/5 dark:divide-white/10">
            {events.data.map((e) => (
              <li key={e.id} className="flex items-center gap-3 px-4 py-2 text-sm">
                <span className="w-10 font-bold tabular-nums">{e.minute != null ? `${e.minute}'` : "-"}</span>
                <span className="chip bg-brand-primary/15 text-brand-primary">
                  {e.type.replaceAll("_", " ")}
                </span>
                <span className="text-muted">{e.detail}</span>
              </li>
            ))}
          </ol>
        ) : (
          <EmptyState title="No timeline events recorded." />
        )}
      </section>
    </div>
  );
}
