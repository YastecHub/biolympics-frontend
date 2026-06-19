import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { MatchCard } from "@/components/MatchCard";
import { CardSkeleton } from "@/components/Skeletons";
import { EmptyState, ErrorState, PageHeader } from "@/components/ui";

export default function Results() {
  const [sport, setSport] = useState("");
  const sports = useQuery({ queryKey: ["sports"], queryFn: api.sports });
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["results", sport],
    queryFn: () => api.results(sport || undefined),
  });

  return (
    <div>
      <PageHeader title="Results" subtitle="Completed matches and final scores." />
      <div className="mb-4">
        <select
          aria-label="Filter results by sport"
          className="rounded-lg border border-black/10 bg-surface px-3 py-2 text-sm dark:border-white/15"
          value={sport}
          onChange={(e) => setSport(e.target.value)}
        >
          <option value="">All sports</option>
          {(sports.data ?? []).map((s) => (
            <option key={s.id} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <CardSkeleton count={6} />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : data && data.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((fx) => (
            <MatchCard key={fx.id} fx={fx} />
          ))}
        </div>
      ) : (
        <EmptyState title="No results yet." hint="They'll appear here as matches finish." />
      )}
    </div>
  );
}
