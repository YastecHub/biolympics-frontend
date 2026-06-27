import { useMemo, useState } from "react";
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
  "PRE-MED": { gold: 6, silver: 3, bronze: 7 },
  MIC: { gold: 5, silver: 2, bronze: 5 },
  CBG: { gold: 4, silver: 6, bronze: 2 },
  BTN: { gold: 5, silver: 1, bronze: 3 },
  ZLY: { gold: 3, silver: 5, bronze: 2 },
  BCH: { gold: 2, silver: 7, bronze: 2 },
  FSH: { gold: 3, silver: 2, bronze: 3 },
  FISHERIES: { gold: 3, silver: 2, bronze: 3 },
  MSM: { gold: 1, silver: 3, bronze: 5 },
};

const MEDAL_POINTS = { gold: 5, silver: 2, bronze: 1 };
const MEDAL_ORDER = ["gold", "silver", "bronze"] as const;

type MedalTone = (typeof MEDAL_ORDER)[number];

type MedalSource = {
  event: string;
  gold: string;
  silver: string;
  bronze: string;
};

type MedalBreakdownItem = {
  event: string;
  medal: MedalTone;
};

const MEDAL_SOURCES: MedalSource[] = [
  { event: "Ludo", gold: "PRE-MED", silver: "CBG", bronze: "BCH" },
  { event: "Chess Male", gold: "CBG", silver: "BCH", bronze: "FISHERIES" },
  { event: "Chess Female", gold: "CBG", silver: "PRE-MED", bronze: "BTN" },
  { event: "Scrabble Male", gold: "CBG", silver: "BCH", bronze: "FISHERIES" },
  { event: "Scrabble Female", gold: "FISHERIES", silver: "BCH", bronze: "MIC" },
  { event: "FIFA Console", gold: "BCH", silver: "CBG", bronze: "MIC" },
  { event: "PES Console", gold: "BTN", silver: "MSM", bronze: "PRE-MED" },
  { event: "COD Mobile", gold: "CBG", silver: "BCH", bronze: "PRE-MED" },
  { event: "Table Tennis Male", gold: "FISHERIES", silver: "BCH", bronze: "PRE-MED" },
  { event: "Table Tennis Female", gold: "MIC", silver: "ZLY", bronze: "CBG" },
  { event: "Volleyball", gold: "MIC", silver: "ZLY", bronze: "PRE-MED" },
  { event: "Basketball", gold: "ZLY", silver: "MIC", bronze: "BTN" },
  { event: "Marathon Female", gold: "BCH", silver: "MIC", bronze: "BTN" },
  { event: "Marathon Male", gold: "BTN", silver: "FISHERIES", bronze: "MSM" },
  { event: "Swimming Female", gold: "PRE-MED", silver: "FISHERIES", bronze: "MIC" },
  { event: "Swimming Male", gold: "ZLY", silver: "MSM", bronze: "PRE-MED" },
  { event: "Long Jump Female", gold: "BTN", silver: "ZLY", bronze: "MIC" },
  { event: "Long Jump Male", gold: "ZLY", silver: "BTN", bronze: "MSM" },
  { event: "100m Female", gold: "BTN", silver: "ZLY", bronze: "MSM" },
  { event: "100m Male", gold: "PRE-MED", silver: "BCH", bronze: "MSM" },
  { event: "200m Female", gold: "BTN", silver: "ZLY", bronze: "MIC" },
  { event: "200m Male", gold: "PRE-MED", silver: "CBG", bronze: "BCH" },
  { event: "400m Female", gold: "MSM", silver: "PRE-MED", bronze: "FISHERIES" },
  { event: "400m Male", gold: "PRE-MED", silver: "CBG", bronze: "CBG" },
  { event: "4x100m Relay Female", gold: "MIC", silver: "PRE-MED", bronze: "ZLY" },
  { event: "4x100m Relay Male", gold: "PRE-MED", silver: "CBG", bronze: "MSM" },
  { event: "4x100m Relay Mixed", gold: "MIC", silver: "CBG", bronze: "PRE-MED" },
  { event: "Female Football", gold: "MIC", silver: "BCH", bronze: "ZLY" },
  { event: "Male Football", gold: "FISHERIES", silver: "MSM", bronze: "PRE-MED" },
];

const MEDAL_BREAKDOWN = buildMedalBreakdown(MEDAL_SOURCES);

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
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const departments = useQuery({ queryKey: ["departments"], queryFn: api.departments });
  const medals = useQuery({ queryKey: ["medal-table"], queryFn: api.medalTable });
  const departmentList = departments.data?.length ? departments.data : FALLBACK_DEPARTMENTS;

  const rows = useMemo(
    () => buildMedalRows(departmentList, medals.data ?? []),
    [departmentList, medals.data],
  );
  const hasMedals = rows.some((row) => row.gold + row.silver + row.bronze > 0);
  const leader = hasMedals ? [...rows].sort(compareMedalRank)[0] : null;
  const selectedRow = rows.find((row) => row.department_id === selectedDepartmentId) ?? null;

  if (departments.isLoading && !rows.length) {
    return <CardSkeleton count={4} />;
  }

  if (departments.isError && !rows.length) {
    return <ErrorState onRetry={() => departments.refetch()} />;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-white/12 bg-white/[0.07] px-4 py-5 shadow-2xl shadow-black/25 sm:rounded-[30px] sm:px-8 sm:py-7">
        <div className="absolute inset-x-0 top-0 h-1 bg-brand-lime" />
        <div className="absolute -right-10 -top-16 h-52 w-52 rounded-full bg-brand-lime/10 blur-3xl" />
        <div className="absolute -bottom-20 left-0 h-56 w-56 rounded-full bg-brand-accent/10 blur-3xl" />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-2 ring-1 ring-white/15 sm:mb-6 sm:gap-3 sm:px-4">
              <Logo variant="mark" size={30} />
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/70 sm:text-xs sm:tracking-[0.18em]">
                ULLSSA Biolympics 2026
              </span>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-lime sm:text-xs sm:tracking-[0.3em]">
              Overall Standing
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold uppercase tracking-[0.08em] sm:mt-3 sm:text-6xl sm:tracking-[0.18em]">
              Medal Table
            </h1>
            <p className="mt-2 max-w-2xl text-xs leading-5 text-white/64 sm:mt-3 sm:text-sm sm:leading-6">
              Departments climb by medals won across the games. Tap any department to see
              exactly where their medals came from.
            </p>
          </div>

          <div className="rounded-xl bg-white/10 p-3 ring-1 ring-white/10 sm:rounded-2xl sm:p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/48 sm:text-xs sm:tracking-[0.2em]">
              Current leader
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-brand-lime sm:mt-2 sm:text-3xl">
              {leader ? leader.department_abbr : "Awaiting first medal"}
            </p>
            <p className="mt-0.5 text-xs text-white/60 sm:mt-1 sm:text-sm">
              {leader ? `${leader.total_points} pts` : "All departments on 0"}
            </p>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-2xl border border-white/12 bg-[#031813]/90 shadow-2xl shadow-black/30 sm:rounded-[28px]">
        <div className="absolute inset-0 opacity-25">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(163,230,53,0.18),transparent_14rem),radial-gradient(circle_at_85%_18%,rgba(250,204,21,0.12),transparent_15rem)]" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0_46%,rgba(255,255,255,0.05)_47%_48%,transparent_49%_100%)] bg-[length:120px_120px]" />
        </div>

        <div className="relative grid grid-cols-[1.65rem_minmax(0,1fr)_repeat(3,2rem)] items-center gap-1 border-b border-white/10 px-2 py-2.5 text-[9px] font-black uppercase tracking-[0.08em] text-white/48 min-[380px]:grid-cols-[1.9rem_minmax(0,1fr)_repeat(3,2.25rem)] sm:grid-cols-[3.5rem_minmax(0,1fr)_repeat(3,4rem)] sm:gap-2 sm:px-5 sm:py-4 sm:text-xs sm:tracking-[0.14em]">
          <span>#</span>
          <span>Department</span>
          <MedalHeader tone="gold" label="Gold" />
          <MedalHeader tone="silver" label="Silver" />
          <MedalHeader tone="bronze" label="Bronze" />
        </div>

        <div className="relative divide-y divide-white/8">
          {rows.map((row) => (
            <MedalDepartmentRow
              key={row.department_id}
              row={row}
              onSelect={() => setSelectedDepartmentId(row.department_id)}
            />
          ))}
        </div>
      </section>

      {selectedRow && (
        <MedalBreakdownSheet
          row={selectedRow}
          items={MEDAL_BREAKDOWN[selectedRow.department_abbr] ?? []}
          onClose={() => setSelectedDepartmentId(null)}
        />
      )}
    </div>
  );
}

function normalizeBreakdownTeam(team: string) {
  return displayDepartmentAbbr(team);
}

function buildMedalBreakdown(sources: MedalSource[]) {
  const breakdown: Record<string, MedalBreakdownItem[]> = {};

  sources.forEach((source) => {
    MEDAL_ORDER.forEach((medal) => {
      const team = normalizeBreakdownTeam(source[medal]);
      breakdown[team] ??= [];
      breakdown[team].push({ event: source.event, medal });
    });
  });

  return breakdown;
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

function MedalDepartmentRow({ row, onSelect }: { row: MedalDisplayRow; onSelect: () => void }) {
  const isTopThree = row.position <= 3;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="grid w-full grid-cols-[1.65rem_minmax(0,1fr)_repeat(3,2rem)] items-center gap-1 px-2 py-2 text-left transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime/70 min-[380px]:grid-cols-[1.9rem_minmax(0,1fr)_repeat(3,2.25rem)] sm:grid-cols-[3.5rem_minmax(0,1fr)_repeat(3,4rem)] sm:gap-2 sm:px-5 sm:py-4"
      aria-label={`View ${row.department_abbr} medal breakdown`}
    >
      <span className="font-display text-base font-bold italic text-white/70 sm:text-2xl">
        {row.position}
      </span>

      <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
        <DepartmentMark abbr={row.department_abbr} color={row.primary_color} logoUrl={row.logo_url} />
        <div className="min-w-0">
          <div className="flex items-center gap-1 sm:gap-2">
            <p className="truncate font-display text-base font-bold uppercase tracking-normal text-white min-[380px]:text-lg sm:text-3xl">
              {row.department_abbr}
            </p>
            {isTopThree && <TopThreeStar />}
          </div>
          <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-white/42 sm:text-xs sm:tracking-[0.12em]">
            {row.total_points} pts
          </p>
        </div>
      </div>

      <MedalCount tone="gold" value={row.gold} />
      <MedalCount tone="silver" value={row.silver} />
      <MedalCount tone="bronze" value={row.bronze} />
    </button>
  );
}

function MedalBreakdownSheet({
  row,
  items,
  onClose,
}: {
  row: MedalDisplayRow;
  items: MedalBreakdownItem[];
  onClose: () => void;
}) {
  const grouped = MEDAL_ORDER.map((medal) => ({
    medal,
    items: items.filter((item) => item.medal === medal),
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/70 p-3 backdrop-blur-sm sm:items-center sm:justify-center sm:p-6">
      <button
        type="button"
        aria-label="Close medal breakdown"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <aside className="relative max-h-[88vh] w-full overflow-hidden rounded-2xl border border-white/12 bg-[#041b15] shadow-2xl shadow-black/50 sm:max-w-2xl">
        <div className="border-b border-white/10 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-lime">
                Medal breakdown
              </p>
              <h2 className="mt-1 font-display text-3xl font-bold uppercase text-white sm:text-4xl">
                {row.department_abbr}
              </h2>
              <p className="mt-1 text-xs font-semibold text-white/55 sm:text-sm">
                {row.gold}G {row.silver}S {row.bronze}B - {row.total_points} pts
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-white/70 ring-1 ring-white/10 transition hover:bg-white/15 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>

        <div className="max-h-[68vh] space-y-4 overflow-y-auto p-4 sm:p-5">
          {grouped.map(({ medal, items: medalItems }) => (
            <section key={medal} className="rounded-xl bg-white/[0.06] p-3 ring-1 ring-white/10">
              <div className="mb-3 flex items-center gap-2">
                <MedalBadge tone={medal} />
                <p className="font-display text-xl font-bold capitalize text-white">
                  {medal}
                </p>
                <span className="ml-auto rounded-full bg-black/20 px-2 py-1 text-xs font-bold text-white/55">
                  {medalItems.length}
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {medalItems.map((item) => (
                  <div
                    key={`${item.medal}-${item.event}`}
                    className="rounded-lg bg-black/18 px-3 py-2 text-sm font-semibold text-white/78 ring-1 ring-white/8"
                  >
                    {item.event}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </aside>
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
      className="grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-full border border-white/30 bg-white text-[8px] font-black text-white shadow-lg min-[380px]:h-8 min-[380px]:w-8 sm:h-12 sm:w-12 sm:text-xs"
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
    <span className="grid justify-items-center gap-0.5 sm:gap-1">
      <MedalBadge tone={tone} label={label} />
      <span className="hidden sm:inline">{label}</span>
    </span>
  );
}

function MedalCount({ tone, value }: { tone: "gold" | "silver" | "bronze"; value: number }) {
  return (
    <span className="grid justify-items-center gap-0.5">
      <MedalBadge tone={tone} />
      <span className="font-display text-sm font-bold leading-none text-white sm:text-lg">
        {value}
      </span>
    </span>
  );
}

function MedalBadge({ tone, label }: { tone: "gold" | "silver" | "bronze"; label?: string }) {
  const number = tone === "gold" ? "1" : tone === "silver" ? "2" : "3";
  return (
    <span
      className={`medal-badge medal-badge-${tone} !h-5 !w-5 !text-[9px] min-[380px]:!h-6 min-[380px]:!w-6 sm:!h-8 sm:!w-8 sm:!text-sm`}
      aria-label={label ?? tone}
      role="img"
    >
      {number}
    </span>
  );
}

