import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CardSkeleton } from "@/components/Skeletons";
import { ErrorState } from "@/components/ui";
import { Logo } from "@/components/Logo";
import { displayDepartmentAbbr, getDepartmentLogoUrl } from "@/lib/departmentLogos";
import type { Department, MedalRow } from "@/types";

const FALLBACK_DEPARTMENTS: Department[] = [
  fallbackDepartment("btn", "Botany", "BTN", "#2e7d32"),
  fallbackDepartment("cbg", "Cell Biology and Genetics", "CBG", "#6a1b9a"),
  fallbackDepartment("msm", "Marine Sciences", "MSM", "#0277bd"),
  fallbackDepartment("mic", "Microbiology", "MIC", "#c62828"),
  fallbackDepartment("zly", "Zoology", "ZLY", "#ef6c00"),
  fallbackDepartment("bch", "Biochemistry", "BCH", "#00838f"),
  fallbackDepartment("pre-med", "Pre-Med", "PRE-MED", "#283593"),
  fallbackDepartment("fisheries", "Fisheries", "FSH", "#558b2f"),
];

const INDOOR_MEDAL_COUNTS: Record<string, { gold: number; silver: number; bronze: number }> = {
  CBG: { gold: 1, silver: 2, bronze: 0 },
  BCH: { gold: 2, silver: 1, bronze: 1 },
  "PRE-MED": { gold: 1, silver: 0, bronze: 1 },
  BTN: { gold: 2, silver: 0, bronze: 1 },
  MSM: { gold: 0, silver: 1, bronze: 1 },
  FSH: { gold: 0, silver: 1, bronze: 1 },
  FISHERIES: { gold: 0, silver: 1, bronze: 1 },
  MIC: { gold: 0, silver: 1, bronze: 1 },
};

const MEDAL_POINTS = { gold: 5, silver: 2, bronze: 1 };

type MedalDisplayRow = {
  department_id: string;
  department_abbr: string;
  department_name: string;
  logo_url: string | null;
  primary_color: string;
  gold: number;
  silver: number;
  bronze: number;
  total_points: number;
  position: number;
};

export default function MedalTable() {
  const departments = useQuery({ queryKey: ["departments"], queryFn: api.departments });
  const medals = useQuery({ queryKey: ["medal-table"], queryFn: api.medalTable });
  const departmentList = departments.data?.length ? departments.data : FALLBACK_DEPARTMENTS;

  const rows = useMemo(
    () => buildMedalRows(departmentList, medals.data ?? []),
    [departmentList, medals.data],
  );
  const hasMedals = rows.some((row) => row.gold + row.silver + row.bronze > 0);
  const leader = hasMedals ? [...rows].sort(compareMedalRank)[0] : null;

  if (departments.isLoading && !rows.length) {
    return <CardSkeleton count={4} />;
  }

  if (departments.isError && !rows.length) {
    return <ErrorState onRetry={() => departments.refetch()} />;
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[30px] border border-white/12 bg-white/[0.07] px-5 py-7 shadow-2xl shadow-black/25 sm:px-8">
        <div className="absolute inset-x-0 top-0 h-1 bg-brand-lime" />
        <div className="absolute -right-10 -top-16 h-52 w-52 rounded-full bg-brand-lime/10 blur-3xl" />
        <div className="absolute -bottom-20 left-0 h-56 w-56 rounded-full bg-brand-accent/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-6 flex w-fit items-center gap-3 rounded-full bg-white/10 px-4 py-2 ring-1 ring-white/15">
              <Logo variant="mark" size={34} />
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">
                ULLSSA Biolympics 2026
              </span>
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-lime">
              Overall Standing
            </p>
            <h1 className="mt-3 font-display text-5xl font-bold uppercase tracking-[0.18em] sm:text-6xl">
              Medal Table
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/64">
              Departments climb by medals won across the games. Gold leads, then silver,
              then bronze. Everyone starts at zero until results are awarded.
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/48">
              Current leader
            </p>
            <p className="mt-2 font-display text-3xl font-bold text-brand-lime">
              {leader ? leader.department_abbr : "Awaiting first medal"}
            </p>
            <p className="mt-1 text-sm text-white/60">
              {leader ? `${leader.total_points} pts` : "All departments on 0"}
            </p>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[28px] border border-white/12 bg-[#031813]/90 shadow-2xl shadow-black/30">
        <div className="absolute inset-0 opacity-25">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(163,230,53,0.18),transparent_14rem),radial-gradient(circle_at_85%_18%,rgba(250,204,21,0.12),transparent_15rem)]" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0_46%,rgba(255,255,255,0.05)_47%_48%,transparent_49%_100%)] bg-[length:120px_120px]" />
        </div>

        <div className="relative grid grid-cols-[2.5rem_minmax(0,1fr)_repeat(3,2.6rem)] items-center gap-2 border-b border-white/10 px-3 py-4 text-xs font-black uppercase tracking-[0.14em] text-white/48 sm:grid-cols-[3.5rem_minmax(0,1fr)_repeat(3,4rem)] sm:px-5">
          <span>#</span>
          <span>Department</span>
          <MedalHeader tone="gold" label="Gold" />
          <MedalHeader tone="silver" label="Silver" />
          <MedalHeader tone="bronze" label="Bronze" />
        </div>

        <div className="relative divide-y divide-white/8">
          {rows.map((row) => (
            <MedalDepartmentRow key={row.department_id} row={row} />
          ))}
        </div>
      </section>
    </div>
  );
}

function buildMedalRows(departments: Department[], medalRows: MedalRow[]): MedalDisplayRow[] {
  const medalByDepartment = new Map(medalRows.map((row) => [row.department_id, row]));

  const rows = departments.map((department) => {
    const medals = medalByDepartment.get(department.id);
    const displayAbbr = displayDepartmentAbbr(department.abbreviation);
    const fallback = INDOOR_MEDAL_COUNTS[department.abbreviation] ??
      INDOOR_MEDAL_COUNTS[displayAbbr] ?? {
      gold: 0,
      silver: 0,
      bronze: 0,
    };
    const gold = Math.max(medals?.gold ?? 0, fallback.gold);
    const silver = Math.max(medals?.silver ?? 0, fallback.silver);
    const bronze = Math.max(medals?.bronze ?? 0, fallback.bronze);
    const totalPoints =
      gold * MEDAL_POINTS.gold + silver * MEDAL_POINTS.silver + bronze * MEDAL_POINTS.bronze;

    return {
      department_id: department.id,
      department_abbr: displayAbbr,
      department_name: department.name,
      logo_url: getDepartmentLogoUrl(department.abbreviation, department.logo_url),
      primary_color: department.primary_color,
      gold,
      silver,
      bronze,
      total_points: totalPoints,
      position: 0,
    };
  });

  return rows.sort(compareMedalRank).map((row, index) => ({ ...row, position: index + 1 }));
}

function compareMedalRank(a: MedalDisplayRow, b: MedalDisplayRow) {
  const byPoints = b.total_points - a.total_points;
  if (byPoints) return byPoints;
  const byGold = b.gold - a.gold;
  if (byGold) return byGold;
  const bySilver = b.silver - a.silver;
  if (bySilver) return bySilver;
  const byBronze = b.bronze - a.bronze;
  if (byBronze) return byBronze;
  return a.department_name.localeCompare(b.department_name);
}

function fallbackDepartment(
  slug: string,
  name: string,
  abbreviation: string,
  primaryColor: string,
): Department {
  return {
    id: slug,
    name,
    abbreviation,
    short_name: name,
    slug,
    logo_url: getDepartmentLogoUrl(abbreviation),
    primary_color: primaryColor,
    secondary_color: primaryColor,
    description: null,
    contact_person: null,
    is_active: true,
  };
}

function MedalDepartmentRow({ row }: { row: MedalDisplayRow }) {
  const isTopThree = row.position <= 3;

  return (
    <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_repeat(3,2.6rem)] items-center gap-2 px-3 py-3 sm:grid-cols-[3.5rem_minmax(0,1fr)_repeat(3,4rem)] sm:px-5 sm:py-4">
      <span className="font-display text-2xl font-bold italic text-white/70">
        {row.position}
      </span>

      <div className="flex min-w-0 items-center gap-3">
        <DepartmentMark abbr={row.department_abbr} color={row.primary_color} logoUrl={row.logo_url} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate font-display text-xl font-bold uppercase tracking-normal text-white sm:text-3xl">
              {row.department_abbr}
            </p>
            {isTopThree && <TopThreeStar />}
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/42">
            {row.total_points} pts
          </p>
        </div>
      </div>

      <MedalCount tone="gold" value={row.gold} />
      <MedalCount tone="silver" value={row.silver} />
      <MedalCount tone="bronze" value={row.bronze} />
    </div>
  );
}

function TopThreeStar() {
  return (
    <span
      className="inline-block h-3 w-3 shrink-0 bg-brand-accent sm:h-3.5 sm:w-3.5"
      style={{
        clipPath:
          "polygon(50% 0%, 61% 34%, 98% 34%, 68% 55%, 79% 91%, 50% 69%, 21% 91%, 32% 55%, 2% 34%, 39% 34%)",
      }}
      aria-label="Top three"
    />
  );
}

function DepartmentMark({ abbr, color, logoUrl }: { abbr: string; color: string; logoUrl: string | null }) {
  return (
    <span
      className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border border-white/30 bg-white text-[10px] font-black text-white shadow-lg sm:h-12 sm:w-12 sm:text-xs"
      style={{ backgroundColor: logoUrl ? "#fff" : color }}
      aria-hidden
    >
      {logoUrl ? (
        <img src={logoUrl} alt="" className="h-full w-full object-contain p-1" decoding="async" />
      ) : (
        abbr.slice(0, 3)
      )}
    </span>
  );
}

function MedalHeader({ tone, label }: { tone: "gold" | "silver" | "bronze"; label: string }) {
  return (
    <span className="grid justify-items-center gap-1">
      <MedalBadge tone={tone} label={label} />
      <span className="hidden sm:inline">{label}</span>
    </span>
  );
}

function MedalCount({ tone, value }: { tone: "gold" | "silver" | "bronze"; value: number }) {
  return (
    <span className="grid justify-items-center gap-0.5">
      <MedalBadge tone={tone} />
      <span className="font-display text-base font-bold leading-none text-white sm:text-lg">
        {value}
      </span>
    </span>
  );
}

function MedalBadge({ tone, label }: { tone: "gold" | "silver" | "bronze"; label?: string }) {
  const number = tone === "gold" ? "1" : tone === "silver" ? "2" : "3";
  return (
    <span
      className={`medal-badge medal-badge-${tone}`}
      aria-label={label ?? tone}
      role="img"
    >
      {number}
    </span>
  );
}

