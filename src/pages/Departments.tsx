import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CardSkeleton } from "@/components/Skeletons";
import { ErrorState, PageHeader } from "@/components/ui";

export default function Departments() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["departments"],
    queryFn: api.departments,
  });

  return (
    <div>
      <PageHeader title="Departments" subtitle="The eight competing departments." />
      {isLoading ? (
        <CardSkeleton count={8} />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {(data ?? []).map((d) => (
            <Link
              key={d.id}
              to={`/departments/${d.slug}`}
              className="card flex items-center gap-3 p-4 hover:ring-brand-primary/40"
            >
              <span
                className="grid h-11 w-11 place-items-center rounded-xl text-xs font-bold text-white"
                style={{ backgroundColor: d.primary_color }}
                aria-hidden
              >
                {d.abbreviation.slice(0, 3)}
              </span>
              <span>
                <span className="block font-display font-bold leading-tight">{d.abbreviation}</span>
                <span className="block text-xs text-muted">{d.name}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
