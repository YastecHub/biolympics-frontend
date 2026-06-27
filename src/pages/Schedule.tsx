import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";

const SCHEDULE_DAYS = [
  {
    day: "Fri",
    date: "19 Jun",
    label: "Indoor Opening",
    events: ["Indoor Games"],
    accent: "#a3e635",
    icon: "🎯",
  },
  {
    day: "Sat",
    date: "20 Jun",
    label: "Run & Football",
    events: ["Marathon", "Male Football", "Female Football"],
    accent: "#22c55e",
    icon: "🏅",
  },
  {
    day: "Mon",
    date: "22 Jun",
    label: "Court Clash",
    events: ["Volleyball K/O", "Basketball K/O", "Male Football MD 2"],
    accent: "#f59e0b",
    icon: "🏀",
  },
  {
    day: "Tue",
    date: "23 Jun",
    label: "Knockout Heat",
    events: ["Female Football Semis", "Male Football MD 3", "Table Tennis"],
    accent: "#38bdf8",
    icon: "🏓",
  },
  {
    day: "Wed",
    date: "24 Jun",
    label: "Speed Session",
    events: ["Athletics Heat", "Volleyball Semis", "Swimming"],
    accent: "#2dd4bf",
    icon: "🏃",
  },
  {
    day: "Thu",
    date: "25 Jun",
    label: "Semi-Final Night",
    events: ["Basketball Semis", "Female Football 3rd Place"],
    accent: "#fb7185",
    icon: "🏐",
  },
  {
    day: "Fri",
    date: "26 Jun",
    label: "Finals Build-Up",
    events: ["Male Football Semis", "Basketball 3rd Place", "Volleyball Final", "Volleyball 3rd Place"],
    accent: "#facc15",
    icon: "⚽",
  },
  {
    day: "Sat",
    date: "27 Jun",
    label: "Final Day",
    events: [
      "Basketball 3rd: CBG vs BTN - 9:30 AM",
      "Basketball Final: MIC vs ZLY - 10:30 AM",
      "Male Football 3rd: MIC vs PRE-MED - 11:00 AM",
      "Female Football 3rd: ZLY vs PRE-MED - 11:30 AM",
      "Long Jump - 12:00 PM",
      "Female Football Final: BCH vs MIC - 12:30 PM",
      "Athletics Finals - 2:00 PM",
      "Football Final: Fisheries vs Marine - 3:00 PM",
    ],
    accent: "#84cc16",
    icon: "🏆",
  },
] as const;

export default function Schedule() {
  return (
    <div className="schedule-experience relative min-h-screen overflow-hidden px-4 pb-12 text-white">
      <div className="festival-pattern" aria-hidden />
      <div className="schedule-glow-orbit" aria-hidden>
        <span>⚽</span>
        <span>🏀</span>
        <span>🏐</span>
        <span>🏓</span>
        <span>🏃</span>
      </div>

      <section className="relative mx-auto max-w-6xl pt-8">
        <div className="schedule-hero-panel overflow-hidden rounded-[30px] border border-white/12 p-6 shadow-2xl sm:p-9">
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
            <div>
              <div className="mb-7 flex w-fit items-center gap-3 rounded-full bg-white/10 px-4 py-2 ring-1 ring-white/15 backdrop-blur">
                <Logo variant="mark" size={36} />
                <span className="text-sm font-bold text-white/80">ULLSSA presents</span>
              </div>
              <p className="font-display text-5xl font-bold uppercase leading-none sm:text-7xl">
                Games
              </p>
              <h1 className="font-display text-6xl font-bold uppercase leading-none text-brand-lime sm:text-8xl">
                Schedule
              </h1>
              <p className="mt-4 max-w-xl text-base text-white/72 sm:text-lg">
                Eight days of football, courts, tracks, indoor battles and finals, ending with today's championship schedule.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Stat label="Days" value="8" />
              <Stat label="Window" value="19-27" />
              <Stat label="Finals" value="5+" />
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto mt-10 max-w-6xl" aria-label="Games schedule timeline">
        <div className="grid gap-4 lg:grid-cols-2">
          {SCHEDULE_DAYS.map((item, index) => (
            <article
              key={`${item.day}-${item.date}`}
              className="schedule-day-card relative overflow-hidden rounded-2xl border border-white/12 p-5 shadow-xl"
              style={{ ["--day-accent" as string]: item.accent }}
            >
              <span className="absolute inset-x-0 top-0 h-1.5 bg-[var(--day-accent)]" />
              <div className="relative flex items-start gap-4">
                <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-white/10 text-center ring-1 ring-white/15">
                  <span className="block font-display text-2xl font-bold text-[var(--day-accent)]">
                    {item.day}
                  </span>
                  <span className="block text-xs font-bold uppercase text-white/62">{item.date}</span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-display text-2xl font-bold">{item.label}</p>
                    <span className="text-4xl opacity-75" aria-hidden>
                      {item.icon}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.events.map((event) => (
                      <span
                        key={event}
                        className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-white/82 ring-1 ring-white/10"
                      >
                        {event}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <span className="pointer-events-none absolute -bottom-8 -right-4 font-display text-9xl font-bold text-white/[0.05]">
                {String(index + 1).padStart(2, "0")}
              </span>
            </article>
          ))}
        </div>
      </section>

      <footer className="relative mx-auto mt-12 flex max-w-6xl flex-col items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/8 px-5 py-4 text-center text-white/70 backdrop-blur sm:flex-row sm:text-left">
        <p className="text-sm">
          Biolympics 2026 · <span className="font-semibold text-white">Beyond the Lab</span>
        </p>
        <Link to="/admin/login" className="rounded-full bg-brand-lime px-5 py-2 text-sm font-bold text-brand-secondary transition hover:-translate-y-0.5">
          Official login
        </Link>
      </footer>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl bg-white/10 p-4 ring-1 ring-white/12 backdrop-blur">
      <p className="whitespace-nowrap font-display text-3xl font-bold leading-none text-brand-lime sm:text-4xl">
        {value}
      </p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-white/58">{label}</p>
    </div>
  );
}

