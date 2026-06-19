import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { MatchCard } from "@/components/MatchCard";
import { CardSkeleton } from "@/components/Skeletons";
import { EmptyState, ErrorState, PageHeader } from "@/components/ui";
import { dayKey, formatDay } from "@/lib/time";
import type { Fixture } from "@/types";

type When = "all" | "upcoming" | "past";

export default function Fixtures() {
  const fixtures = useQuery({ queryKey: ["fixtures"], queryFn: () => api.schedule() });
  const sports = useQuery({ queryKey: ["sports"], queryFn: api.sports });

  const [sport, setSport] = useState("");
  const [when, setWhen] = useState<When>("all");
  const [search, setSearch] = useState("");

  const grouped = useMemo(() => {
    const now = Date.now();
    const list = (fixtures.data ?? []).filter((f) => {
      if (sport && f.sport_slug !== sport) return false;
      if (when === "upcoming" && f.scheduled_start && new Date(f.scheduled_start).getTime() < now)
        return false;
      if (when === "past" && (!f.scheduled_start || new Date(f.scheduled_start).getTime() >= now))
        return false;
      if (search) {
        const hay = `${f.sport_name} ${f.home?.department_abbr ?? ""} ${
          f.away?.department_abbr ?? ""
        } ${f.round_name ?? ""}`.toLowerCase();
        if (!hay.includes(search.toLowerCase())) return false;
      }
      return true;
    });
    const map = new Map<string, Fixture[]>();
    for (const f of list) {
      const key = dayKey(f.scheduled_start);
      map.set(key, [...(map.get(key) ?? []), f]);
    }
    return [...map.entries()].sort(([a], [b]) => (a === "TBD" ? 1 : b === "TBD" ? -1 : a.localeCompare(b)));
  }, [fixtures.data, sport, when, search]);

  return (
    <div>
      <PageHeader title="Schedule" subtitle="Filter by sport, time and search." />

      <div className="card mb-4 flex flex-wrap items-center gap-2 p-3">
        <select
          aria-label="Filter by sport"
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
        <div className="flex rounded-lg border border-black/10 p-0.5 dark:border-white/15">
          {(["all", "upcoming", "past"] as When[]).map((w) => (
            <button
              key={w}
              onClick={() => setWhen(w)}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold capitalize ${
                when === w ? "bg-brand-primary text-white" : "text-muted"
              }`}
            >
              {w}
            </button>
          ))}
        </div>
        <input
          aria-label="Search fixtures"
          placeholder="Search team or round…"
          className="flex-1 rounded-lg border border-black/10 bg-surface px-3 py-2 text-sm dark:border-white/15"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {fixtures.isLoading ? (
        <CardSkeleton count={6} />
      ) : fixtures.isError ? (
        <ErrorState onRetry={fixtures.refetch} />
      ) : grouped.length === 0 ? (
        <EmptyState title="No fixtures match your filters." />
      ) : (
        <div className="space-y-6">
          {grouped.map(([day, list]) => (
            <section key={day}>
              <h2 className="mb-2 font-display text-lg font-bold text-muted">
                {day === "TBD" ? "Date TBD" : formatDay(list[0].scheduled_start)}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((fx) => (
                  <MatchCard key={fx.id} fx={fx} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
