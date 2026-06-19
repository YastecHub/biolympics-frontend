import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CardSkeleton } from "@/components/Skeletons";
import { EmptyState, ErrorState, PageHeader } from "@/components/ui";
import { StandingsTable } from "@/components/StandingsTable";

export default function Standings() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["standings"],
    queryFn: () => api.standings(),
  });

  return (
    <div>
      <PageHeader title="Standings" subtitle="Group tables, recalculated after every result." />
      {isLoading ? (
        <CardSkeleton count={2} />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : data && data.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {data.map((st) => (
            <StandingsTable key={`${st.sport_slug}-${st.group_name}`} standing={st} />
          ))}
        </div>
      ) : (
        <EmptyState title="No tables yet." hint="Standings appear once group matches are played." />
      )}
    </div>
  );
}
