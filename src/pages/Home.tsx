import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Logo } from "@/components/Logo";
import { sportIcon } from "@/lib/sportIcons";
import type { Sport } from "@/types";

type HomeSport = {
  title: string;
  slugs: string[];
  accent: string;
  route: string;
  meta: string;
};

const HOME_SPORTS: HomeSport[] = [
  {
    title: "Indoor Games",
    slugs: ["chess", "scrabble", "ludo", "fifa-console", "pes-console", "cod-mobile", "indoor-games"],
    accent: "#9be22d",
    route: "/sports/indoor-games",
    meta: "fixtures / bracket",
  },
  {
    title: "Football",
    slugs: ["male-football", "female-football"],
    accent: "#8ddf29",
    route: "/sports/male-football",
    meta: "fixtures / table",
  },
  {
    title: "Track Events",
    slugs: ["athletics", "swimming"],
    accent: "#2d9cf0",
    route: "/sports/athletics",
    meta: "heats / finals",
  },
  {
    title: "Basketball",
    slugs: ["basketball"],
    accent: "#ff9f1c",
    route: "/sports/basketball",
    meta: "fixtures / draw",
  },
  {
    title: "Volleyball",
    slugs: ["volleyball"],
    accent: "#f0139a",
    route: "/sports/volleyball",
    meta: "fixtures / draw",
  },
  {
    title: "Table Tennis",
    slugs: ["table-tennis"],
    accent: "#38bdf8",
    route: "/sports/table-tennis",
    meta: "fixtures / bracket",
  },
  {
    title: "Marathon",
    slugs: ["marathon"],
    accent: "#f9d620",
    route: "/sports/marathon",
    meta: "registration / race",
  },
];

const TODAY_SPORTS = [
  { name: "Marathon", time: "6 AM", meta: "Registration closed", route: "/sports/marathon", icon: "marathon" },
  { name: "Female football", time: "11 AM", meta: "ISL Football Pitch", route: "/sports/female-football", icon: "football" },
  { name: "Male football", time: "12:45 PM", meta: "ISL Football Pitch", route: "/sports/male-football", icon: "football" },
];

function yearFromRange(start?: string | null) {
  return start ? new Date(`${start}T12:00:00`).getFullYear() : 2026;
}

function categorySports(sports: Sport[] | undefined, group: HomeSport) {
  return (sports ?? [])
    .filter((sport) => group.slugs.includes(sport.slug))
    .sort((a, b) => a.display_order - b.display_order);
}

export default function Home() {
  const tournament = useQuery({ queryKey: ["tournament"], queryFn: api.currentTournament });
  const sports = useQuery({ queryKey: ["sports"], queryFn: api.sports });
  const live = useQuery({ queryKey: ["live"], queryFn: api.liveFixtures });

  const year = yearFromRange(tournament.data?.start_date);
  const liveCount = live.data?.length ?? 0;

  return (
    <div className="festival-home relative min-h-screen overflow-hidden px-4 pb-12 text-white">
      <div className="festival-pattern" aria-hidden />

      <section className="relative mx-auto max-w-5xl pt-5 sm:pt-8">
        <div className="festival-hero relative overflow-hidden rounded-[28px] border border-white/15 px-5 py-14 text-center shadow-2xl sm:px-10 sm:py-20">
          <div className="festival-sky" aria-hidden />
          <div className="festival-sports-orbit" aria-hidden>
            <span>{sportIcon("basketball")}</span>
            <span>{sportIcon("football")}</span>
            <span>{sportIcon("volleyball")}</span>
            <span>{sportIcon("table-tennis")}</span>
            <span>{sportIcon("efootball")}</span>
          </div>
          <div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-3xl bg-white/90 shadow-xl ring-1 ring-white/40 backdrop-blur">
            <Logo variant="mark" size={80} />
          </div>

          <p className="relative mt-8 font-display text-5xl font-bold uppercase leading-none tracking-normal text-white sm:text-7xl lg:text-8xl">
            BIOLYMPICS
          </p>
          <h1 className="relative mx-auto mt-2 max-w-4xl font-display text-6xl font-bold uppercase leading-none tracking-normal text-brand-lime sm:text-8xl lg:text-9xl">
            {year}
          </h1>
          <p className="relative mx-auto mt-5 max-w-md font-display text-2xl font-bold italic text-white/85">
            "Beyond the Lab"
          </p>

          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/medal-table"
              className="rounded-full bg-brand-lime px-6 py-3 text-sm font-bold text-brand-secondary shadow-lg shadow-brand-lime/20 transition hover:-translate-y-0.5 hover:shadow-brand-lime/35"
            >
              Overall Standings
            </Link>
            <Link
              to="/schedule"
              className="rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/15"
            >
              Schedule
            </Link>
          </div>

          <HeroUpdateNotice />
        </div>
      </section>

      <section className="relative mx-auto mt-12 max-w-5xl" aria-labelledby="sports-heading">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2
            id="sports-heading"
            className="font-display text-4xl font-bold text-white drop-shadow-[0_0_18px_rgb(163_230_53_/_0.38)]"
          >
            Sports
          </h2>
          {liveCount > 0 && <Link to="/live" className="text-sm font-semibold text-brand-lime">{liveCount} live</Link>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HOME_SPORTS.map((group) => (
            <SportCard
              key={group.title}
              group={group}
              related={categorySports(sports.data, group)}
              isLoading={sports.isLoading}
            />
          ))}
        </div>
      </section>

      <footer className="relative mx-auto mt-14 max-w-5xl text-center text-white/60">
        <p className="font-display text-3xl font-bold text-brand-lime">
          Faculty of Life Sciences Biolympics {year}
        </p>
        <p className="mt-1 text-sm font-semibold">June 19th to June 27th</p>
        <p className="mt-1 text-sm">University of Lagos, Lagos, Nigeria.</p>
      </footer>
    </div>
  );
}

function HeroUpdateNotice() {
  return (
    <div
      className="relative mx-auto mt-6 max-w-2xl rounded-2xl border border-white/12 bg-white/10 px-4 py-4 text-left shadow-lg shadow-black/15 backdrop-blur"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-full bg-brand-accent/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-brand-accent">
          News / Updates
        </span>
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/55">Today</span>
      </div>
      <p className="mt-3 font-display text-2xl font-bold tracking-normal text-white sm:text-3xl">
        Today's sports lineup
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {TODAY_SPORTS.map((sport) => (
          <Link
            key={sport.name}
            to={sport.route}
            className="group flex min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-black/15 px-3 py-3 transition hover:-translate-y-0.5 hover:border-brand-lime/50 hover:bg-white/10"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-lg" aria-hidden>
              {sportIcon(sport.icon)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-black uppercase tracking-normal text-white">
                {sport.name}
              </span>
              <span className="mt-0.5 block text-xs font-bold uppercase tracking-[0.14em] text-brand-lime">
                {sport.time}
              </span>
              <span className="mt-1 block truncate text-[11px] font-semibold text-white/48">
                {sport.meta}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
function SportCard({
  group,
  related,
  isLoading,
}: {
  group: HomeSport;
  related: Sport[];
  isLoading: boolean;
}) {
  const primary = related[0];

  return (
    <Link
      to={group.route}
      className="festival-sport-card group relative min-h-44 overflow-hidden rounded-xl border border-white/12 p-5 text-white transition hover:-translate-y-1 hover:border-white/30"
      style={{ ["--sport-accent" as string]: group.accent }}
    >
      <span className="absolute inset-x-0 top-0 h-1.5 bg-[var(--sport-accent)]" />
      <span className="h-2.5 w-2.5 rounded-full bg-[var(--sport-accent)]" aria-hidden />
      <span className="mt-7 block font-display text-3xl font-bold tracking-normal">
        {group.title}
      </span>
      <span className="mt-7 block text-xs font-semibold uppercase tracking-[0.16em] text-white/62">
        {group.meta}
      </span>
      {related.length > 0 ? (
        <span className="mt-4 flex flex-wrap gap-1.5">
          {related.slice(0, 3).map((sport) => (
            <span key={sport.id} className="rounded-full bg-white/10 px-2 py-1 text-[11px] text-white/75">
              {sportIcon(sport.slug, sport.icon)} {sport.name}
            </span>
          ))}
        </span>
      ) : (
        <span className="mt-4 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
          {isLoading ? "View events" : "Tap to view"}
        </span>
      )}
      <span className="pointer-events-none absolute -bottom-5 -right-3 font-display text-8xl font-bold text-white/[0.08] transition group-hover:text-white/[0.14]">
        {primary ? sportIcon(primary.slug, primary.icon) : sportIcon(group.slugs[0])}
      </span>
    </Link>
  );
}
