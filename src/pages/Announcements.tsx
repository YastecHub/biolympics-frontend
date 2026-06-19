import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CardSkeleton } from "@/components/Skeletons";
import { EmptyState, ErrorState, PageHeader } from "@/components/ui";
import { formatDateTime } from "@/lib/time";

const TYPE_STYLES: Record<string, string> = {
  URGENT: "bg-danger/15 text-danger",
  VENUE_CHANGE: "bg-warning/15 text-warning",
  POSTPONEMENT: "bg-warning/15 text-warning",
  SCHEDULE_CHANGE: "bg-warning/15 text-warning",
  WEATHER: "bg-brand-accent/15 text-brand-accent",
  RESULT_CORRECTION: "bg-brand-primary/15 text-brand-primary",
  GENERAL: "bg-black/5 text-muted dark:bg-white/10",
};

export default function Announcements() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["announcements"],
    queryFn: api.announcements,
  });

  return (
    <div>
      <PageHeader title="Announcements" subtitle="Venue changes, postponements and news." />
      {isLoading ? (
        <CardSkeleton count={3} />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : data && data.length > 0 ? (
        <div className="space-y-3">
          {data.map((a) => (
            <article key={a.id} className="card p-4">
              <div className="mb-1 flex items-center gap-2">
                <span className={`chip ${TYPE_STYLES[a.type] ?? TYPE_STYLES.GENERAL}`}>
                  {a.type.replaceAll("_", " ")}
                </span>
                {a.is_urgent && <span className="chip bg-danger text-white">URGENT</span>}
                <span className="ml-auto text-xs text-muted">
                  {formatDateTime(a.published_at)}
                </span>
              </div>
              <h2 className="font-display text-lg font-bold">{a.title}</h2>
              <p className="text-sm text-muted">{a.body}</p>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="No announcements yet." />
      )}
    </div>
  );
}
