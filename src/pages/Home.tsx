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
    slugs: ["chess", "scrabble", "ludo", "efootball", "cod-mobile", "indoor-games"],
    accent: "#9be22d",
    route: "/sports/indoor-games",
    meta: "schedule · bracket",
  },
  {
    title: "Football",
    slugs: ["male-football", "female-football"],
    accent: "#8ddf29",
    route: "/sports/male-football",
    meta: "schedule · table",
  },
  {
    title: "Track Events",
    slugs: ["athletics", "swimming"],
    accent: "#2d9cf0",
    route: "/sports/athletics",
    meta: "heats · finals",
  },
  {
    title: "Basketball",
    slugs: ["basketball"],
    accent: "#ff9f1c",
    route: "/sports/basketball",
    meta: "schedule · table",
  },
  {
    title: "Volleyball",
    slugs: ["volleyball"],
    accent: "#f0139a",
    route: "/sports/volleyball",
    meta: "schedule · table",
  },
  {
    title: "Table Tennis",
    slugs: ["table-tennis"],
    accent: "#38bdf8",
    route: "/sports/table-tennis",
    meta: "schedule · bracket",
  },
  {
    title: "Marathon",
    slugs: ["marathon"],
    accent: "#f9d620",
    route: "/sports/marathon",
    meta: "schedule · results",
  },
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
            <span>🏀</span>
            <span>⚽</span>
            <span>🏐</span>
            <span>🏓</span>
            <span>🎮</span>
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
            “Beyond the Lab”
          </p>

          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/sports" className="rounded-full bg-brand-lime px-6 py-3 text-sm font-bold text-brand-secondary shadow-lg transition hover:-translate-y-0.5">
              Browse sports
            </Link>
            <Link to="/schedule" className="rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/15">
              Schedule
            </Link>
          </div>
        </div>
      </section>

      <section className="relative mx-auto mt-12 max-w-5xl" aria-labelledby="sports-heading">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 id="sports-heading" className="font-display text-4xl font-bold">
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
          BIOLYMPICS {year}
        </p>
        <p className="mt-1 font-display text-lg font-bold italic">Beyond the Lab</p>
        <p className="mt-3 text-sm">University of Lagos Life Science Students&apos; Association</p>
      </footer>
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
      to={primary ? `/sports/${primary.slug}` : group.route}
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
