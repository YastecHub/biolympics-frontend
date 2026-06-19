import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CardSkeleton } from "@/components/Skeletons";
import { ErrorState, PageHeader } from "@/components/ui";
import { sportIcon } from "@/lib/sportIcons";

export default function Sports() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["sports"],
    queryFn: api.sports,
  });

  return (
    <div>
      <PageHeader title="Sports" subtitle="Pick a sport for schedule, results and tables." />
      {isLoading ? (
        <CardSkeleton count={6} />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {(data ?? []).map((s) => (
            <Link key={s.id} to={`/sports/${s.slug}`} className="card-interactive p-4">
              <div className="mb-1 text-3xl" aria-hidden>
                {sportIcon(s.slug, s.icon)}
              </div>
              <p className="font-display text-lg font-bold">{s.name}</p>
              <p className="mt-1 text-xs text-muted">
                {s.competition_format.replaceAll("_", " ")} · {s.gender_category}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {s.requires_table && <span className="chip bg-brand-primary/15 text-brand-primary">Table</span>}
                {s.requires_bracket && <span className="chip bg-brand-accent/15 text-brand-accent">Bracket</span>}
                {s.supports_live && <span className="chip bg-success/15 text-success">Live</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
