import type { Standing } from "@/types";

export function StandingsTable({ standing }: { standing: Standing }) {
  return (
    <div className="card overflow-hidden">
      {standing.group_name && (
        <h3 className="border-b border-black/5 px-4 py-3 font-display text-lg font-bold dark:border-white/10">
          {standing.group_name}
        </h3>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">
            Standings for {standing.group_name ?? standing.sport_slug}
          </caption>
          <thead className="text-left text-xs uppercase text-muted">
            <tr className="border-b border-black/5 dark:border-white/10">
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Team</th>
              <th className="px-2 py-2 text-center" title="Played">P</th>
              <th className="px-2 py-2 text-center" title="Won">W</th>
              <th className="px-2 py-2 text-center" title="Drawn">D</th>
              <th className="px-2 py-2 text-center" title="Lost">L</th>
              <th className="px-2 py-2 text-center" title="Goal difference">GD</th>
              <th className="px-2 py-2 text-center font-bold" title="Points">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standing.rows.map((r) => (
              <tr key={r.team_id} className="border-b border-black/5 last:border-0 dark:border-white/5">
                <td className="px-3 py-2 text-muted">{r.position}</td>
                <td className="px-3 py-2 font-semibold">
                  {r.department_abbr ?? r.team_id.slice(0, 6)}
                </td>
                <td className="px-2 py-2 text-center">{r.played}</td>
                <td className="px-2 py-2 text-center">{r.won}</td>
                <td className="px-2 py-2 text-center">{r.drawn}</td>
                <td className="px-2 py-2 text-center">{r.lost}</td>
                <td className="px-2 py-2 text-center tabular-nums">
                  {r.goal_difference > 0 ? `+${r.goal_difference}` : r.goal_difference}
                </td>
                <td className="px-2 py-2 text-center font-bold tabular-nums">{r.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {standing.tie_breakers.length > 0 && (
        <p className="border-t border-black/5 px-4 py-2 text-xs text-muted dark:border-white/10">
          Tie-breakers: {standing.tie_breakers.join(" → ")}
        </p>
      )}
    </div>
  );
}
