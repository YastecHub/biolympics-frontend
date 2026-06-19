import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CardSkeleton } from "@/components/Skeletons";
import { EmptyState, ErrorState } from "@/components/ui";

export default function MedalTable() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["medal-table"],
    queryFn: api.medalTable,
  });

  const leader = data?.[0];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[28px] border border-white/12 bg-white/[0.07] px-5 py-8 shadow-2xl shadow-black/20 sm:px-8">
        <div className="absolute inset-x-0 top-0 h-1 bg-brand-lime" />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-lime">Overall Standings</p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Medal leaderboard
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-white/66">
              Departments rise by medals earned across events. Gold comes first, then silver, then bronze, with total points as the final event table score.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/48">Current leader</p>
            <p className="mt-2 font-display text-3xl font-bold text-brand-lime">
              {leader ? leader.department_abbr : "TBD"}
            </p>
            <p className="mt-1 text-sm text-white/60">
              {leader ? `${leader.total_points} pts` : "No medals yet"}
            </p>
          </div>
        </div>
      </section>

      {isLoading ? (
        <CardSkeleton count={2} />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : data && data.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-white/12 bg-white/[0.07] shadow-2xl shadow-black/20">
          <div className="grid grid-cols-[3rem_1fr_repeat(4,minmax(3.2rem,auto))] gap-2 border-b border-white/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white/48">
            <span>#</span>
            <span>Department</span>
            <span className="text-center">Gold</span>
            <span className="text-center">Silver</span>
            <span className="text-center">Bronze</span>
            <span className="text-center text-brand-lime">Points</span>
          </div>
          <div className="divide-y divide-white/8">
            {data.map((m) => (
              <div
                key={m.department_id}
                className="grid grid-cols-[3rem_1fr_repeat(4,minmax(3.2rem,auto))] items-center gap-2 px-4 py-4 text-sm"
              >
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 font-black text-white/72">
                  {m.position}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-display text-xl font-bold">{m.department_abbr}</p>
                  <p className="truncate text-xs text-white/50">{m.department_name}</p>
                </div>
                <span className="text-center font-bold">{m.gold}</span>
                <span className="text-center font-bold">{m.silver}</span>
                <span className="text-center font-bold">{m.bronze}</span>
                <span className="text-center font-display text-xl font-bold text-brand-lime">{m.total_points}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState title="No medals awarded yet." hint="The table fills up as finals are decided." />
      )}
    </div>
  );
}
