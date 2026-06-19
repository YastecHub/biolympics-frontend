import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CardSkeleton } from "@/components/Skeletons";
import { EmptyState, ErrorState } from "@/components/ui";
import { formatDateTime } from "@/lib/time";

const TYPE_STYLES: Record<string, string> = {
  URGENT: "bg-danger/20 text-danger",
  VENUE_CHANGE: "bg-brand-accent/20 text-brand-accent",
  POSTPONEMENT: "bg-brand-accent/20 text-brand-accent",
  SCHEDULE_CHANGE: "bg-brand-accent/20 text-brand-accent",
  WEATHER: "bg-sky-400/20 text-sky-200",
  RESULT_CORRECTION: "bg-brand-lime/20 text-brand-lime",
  GENERAL: "bg-white/10 text-white/70",
};

export default function Announcements() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["announcements"],
    queryFn: api.announcements,
  });

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[28px] border border-white/12 bg-white/[0.07] px-5 py-8 shadow-2xl shadow-black/20 sm:px-8">
        <div className="absolute inset-x-0 top-0 h-1 bg-brand-accent" />
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-accent">News / Updates</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Festival announcements
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-white/66">
          Schedule changes, venue notes, urgent notices and event updates will show here as the festival moves.
        </p>
      </section>

      {isLoading ? (
        <CardSkeleton count={3} />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : data && data.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map((a) => (
            <article key={a.id} className="relative overflow-hidden rounded-2xl border border-white/12 bg-white/[0.07] p-5 shadow-xl shadow-black/15">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase ${TYPE_STYLES[a.type] ?? TYPE_STYLES.GENERAL}`}>
                  {a.type.replaceAll("_", " ")}
                </span>
                {a.is_urgent && <span className="rounded-full bg-danger px-2.5 py-1 text-xs font-bold text-white">Urgent</span>}
                {a.published_at && (
                  <span className="ml-auto text-xs text-white/45">
                    {formatDateTime(a.published_at)}
                  </span>
                )}
              </div>
              <h2 className="mt-4 font-display text-2xl font-bold">{a.title}</h2>
              <p className="mt-2 text-sm leading-6 text-white/64">{a.body}</p>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="No announcements yet." hint="Schedule changes and festival news will appear here." />
      )}
    </div>
  );
}
