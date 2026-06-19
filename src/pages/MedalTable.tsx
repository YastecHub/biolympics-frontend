import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CardSkeleton } from "@/components/Skeletons";
import { EmptyState, ErrorState, PageHeader } from "@/components/ui";

export default function MedalTable() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["medal-table"],
    queryFn: api.medalTable,
  });

  return (
    <div>
      <PageHeader title="Medal Table" subtitle="Overall department points across all sports." />
      {isLoading ? (
        <CardSkeleton count={2} />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : data && data.length > 0 ? (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted">
              <tr className="border-b border-black/5 dark:border-white/10">
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Department</th>
                <th className="px-2 py-2 text-center">🥇</th>
                <th className="px-2 py-2 text-center">🥈</th>
                <th className="px-2 py-2 text-center">🥉</th>
                <th className="px-2 py-2 text-center">Bonus</th>
                <th className="px-2 py-2 text-center font-bold">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.map((m) => (
                <tr key={m.department_id} className="border-b border-black/5 last:border-0 dark:border-white/5">
                  <td className="px-3 py-2 text-muted">{m.position}</td>
                  <td className="px-3 py-2 font-semibold">
                    {m.department_abbr}
                    <span className="ml-2 hidden text-xs font-normal text-muted sm:inline">
                      {m.department_name}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-center">{m.gold}</td>
                  <td className="px-2 py-2 text-center">{m.silver}</td>
                  <td className="px-2 py-2 text-center">{m.bronze}</td>
                  <td className="px-2 py-2 text-center">{m.bonus_points}</td>
                  <td className="px-2 py-2 text-center font-bold tabular-nums">{m.total_points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="No medals awarded yet." hint="The table fills up as finals are decided." />
      )}
    </div>
  );
}
