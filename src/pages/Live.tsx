import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { MatchCard } from "@/components/MatchCard";
import { CardSkeleton } from "@/components/Skeletons";
import { EmptyState, ErrorState, PageHeader } from "@/components/ui";

export default function Live() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["live"],
    queryFn: api.liveFixtures,
    refetchInterval: 20_000, // polling fallback when WebSockets are unavailable
  });

  return (
    <div>
      <PageHeader title="Live" subtitle="Scores update automatically as they happen." />
      {isLoading ? (
        <CardSkeleton count={4} />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : data && data.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((fx) => (
            <MatchCard key={fx.id} fx={fx} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No events are live right now."
          hint="Check the fixtures page for the next matches."
        />
      )}
    </div>
  );
}
