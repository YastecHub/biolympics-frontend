import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { MatchCard } from "@/components/MatchCard";
import { CardSkeleton } from "@/components/Skeletons";
import { EmptyState, FollowButton, PageHeader } from "@/components/ui";
import { displayDepartmentAbbr, getDepartmentLogoUrl } from "@/lib/departmentLogos";
import { useFollowStore } from "@/store";

export default function DepartmentDetail() {
  const { slug = "" } = useParams();
  const following = useFollowStore((s) => s.isFollowing("departments", slug));
  const toggle = useFollowStore((s) => s.toggleDepartment);

  const dept = useQuery({ queryKey: ["department", slug], queryFn: () => api.department(slug) });
  const schedule = useQuery({ queryKey: ["fixtures"], queryFn: () => api.schedule() });
  const medals = useQuery({ queryKey: ["medal-table"], queryFn: api.medalTable });

  const abbr = dept.data?.abbreviation;
  const related = (schedule.data ?? []).filter(
    (f) => f.home?.department_abbr === abbr || f.away?.department_abbr === abbr,
  );
  const medalRow = (medals.data ?? []).find((m) => m.department_abbr === abbr);
  const logo = getDepartmentLogoUrl(dept.data?.abbreviation, dept.data?.logo_url);
  const displayAbbr = displayDepartmentAbbr(abbr);

  return (
    <div>
      <PageHeader
        title={dept.data?.name ?? "Department"}
        subtitle={displayAbbr}
        action={
          <FollowButton following={following} onClick={() => toggle(slug)} label="department" />
        }
      />

      {dept.data && (
        <div
          className="card mb-4 flex items-center gap-4 p-4"
          style={{ borderLeft: `6px solid ${dept.data.primary_color}` }}
        >
          {logo && (
            <span className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white p-2 ring-1 ring-white/15">
              <img src={logo} alt={`${dept.data.name} logo`} className="h-full w-full object-contain" />
            </span>
          )}
          <div className="min-w-0">
            <p className="text-sm text-muted">{dept.data.description ?? "Faculty of Life Sciences department."}</p>
          {medalRow && (
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              <MedalMini tone="gold" value={medalRow.gold} />
              <MedalMini tone="silver" value={medalRow.silver} />
              <MedalMini tone="bronze" value={medalRow.bronze} />
              <span className="font-bold">#{medalRow.position} / {medalRow.total_points} pts</span>
            </div>
          )}
          </div>
        </div>
      )}

      <h2 className="mb-2 font-display text-xl font-bold">Fixtures &amp; Results</h2>
      {schedule.isLoading ? (
        <CardSkeleton count={4} />
      ) : related.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((fx) => (
            <MatchCard key={fx.id} fx={fx} />
          ))}
        </div>
      ) : (
        <EmptyState title="No fixtures for this department yet." />
      )}
    </div>
  );
}

function MedalMini({ tone, value }: { tone: "gold" | "silver" | "bronze"; value: number }) {
  const number = tone === "gold" ? "1" : tone === "silver" ? "2" : "3";
  return (
    <span className="inline-flex items-center gap-1.5 font-bold">
      <span
        className={`medal-badge medal-badge-${tone} h-6 w-6 text-xs`}
        aria-label={tone}
        role="img"
      >
        {number}
      </span>
      {value}
    </span>
  );
}

