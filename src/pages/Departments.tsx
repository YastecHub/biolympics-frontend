import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CardSkeleton } from "@/components/Skeletons";
import { ErrorState, PageHeader } from "@/components/ui";
import { getDepartmentLogoUrl } from "@/lib/departmentLogos";

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
          {(data ?? []).map((d) => {
            const logo = getDepartmentLogoUrl(d.abbreviation, d.logo_url);
            return (
              <Link
                key={d.id}
                to={`/departments/${d.slug}`}
                className="card flex items-center gap-3 p-4 hover:ring-brand-primary/40"
              >
                <span
                  className="grid h-12 w-12 place-items-center overflow-hidden rounded-xl bg-white text-xs font-bold text-white ring-1 ring-white/15"
                  style={{ backgroundColor: logo ? "#fff" : d.primary_color }}
                  aria-hidden
                >
                  {logo ? (
                    <img src={logo} alt="" className="h-full w-full object-contain p-1" loading="lazy" />
                  ) : (
                    d.abbreviation.slice(0, 3)
                  )}
                </span>
                <span>
                  <span className="block font-display font-bold leading-tight">{d.abbreviation}</span>
                  <span className="block text-xs text-muted">{d.name}</span>
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
