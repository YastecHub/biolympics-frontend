import { type ReactNode, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { displayDepartmentAbbr, getDepartmentLogoUrl } from "@/lib/departmentLogos";
import { sportIcon } from "@/lib/sportIcons";
import { MatchCard } from "@/components/MatchCard";
import { CardSkeleton } from "@/components/Skeletons";
import { EmptyState, FollowButton, MatchupTeams } from "@/components/ui";
import { StandingsTable } from "@/components/StandingsTable";
import { useFollowStore } from "@/store";
import type { Department, Fixture } from "@/types";
import { LIVE_STATUSES } from "@/types";

const TABS = ["Overview", "Fixtures", "Results", "Standings"] as const;
type Tab = (typeof TABS)[number];

const INDOOR_GAMES = [
  { name: "Chess", slug: "chess", note: "Board discipline" },
  { name: "Scrabble", slug: "scrabble", note: "Word battle" },
  { name: "Ludo", slug: "ludo", note: "Knockout board play" },
  { name: "FIFA Console", slug: "fifa-console", note: "Console football" },
  { name: "PES Console", slug: "pes-console", note: "Console football" },
  { name: "CODM", slug: "cod-mobile", note: "Mobile team play" },
] as const;

const INDOOR_PAIRINGS = [
  ["BCH", "BTN"],
  ["PRE-MED", "MIC"],
  ["CBG", "ZLY"],
  ["MSM", "FISHERIES"],
] as const;

type FootballGender = "male" | "female";
type FootballView = "table" | "fixtures" | "results";
type IndoorView = "fixtures" | "results";
type MixedSportSlug = "basketball" | "volleyball";
type MixedSportView = "draw" | "fixtures" | "results";
type TrackView = "events" | "fixtures" | "results";
type TableTennisView = "format" | "fixtures" | "results";

type FootballMatch = {
  id: string;
  gender: FootballGender;
  group: string;
  stage: string;
  matchDay: string;
  home: string;
  away: string;
  scheduledTime?: string;
  venue?: string;
  startIso?: string;
  durationMinutes?: number;
};

type MixedSportMatch = {
  id: string;
  sportSlug: MixedSportSlug;
  sportName: string;
  stage: string;
  matchDay: string;
  home: string;
  away: string;
};

type TrackEvent = {
  id: string;
  name: string;
  category: string;
  stage: string;
  entry: string;
};

type TableTennisMatch = {
  id: string;
  category: "Male" | "Female";
  stage: string;
  matchDay: string;
  home: string;
  away: string;
};

type IndoorMatchResult = {
  home: string;
  away: string;
  homeScore?: number;
  awayScore?: number;
  winner?: string;
  note?: string;
};

type IndoorResultRound = {
  round: string;
  matches: IndoorMatchResult[];
};

type IndoorMedalWinner = {
  medal: "Gold" | "Silver" | "Bronze";
  team: string;
  names?: string[];
};

type IndoorResultGroup = {
  title: string;
  meta: string;
  rounds: IndoorResultRound[];
  medals?: IndoorMedalWinner[];
};

const INDOOR_RESULTS: Record<string, IndoorResultGroup[]> = {
  ludo: [
    {
      title: "Ludo",
      meta: "Open knockout",
      rounds: [
        {
          round: "Quarter Final",
          matches: [
            { home: "BCH", away: "BTN", homeScore: 2, awayScore: 0 },
            { home: "PRE-MED", away: "MIC", homeScore: 2, awayScore: 0 },
            { home: "CBG", away: "ZLY", homeScore: 2, awayScore: 1 },
            { home: "MSM", away: "FISHERIES", homeScore: 0, awayScore: 2 },
          ],
        },
        {
          round: "Semi Final",
          matches: [
            { home: "PRE-MED", away: "BCH", homeScore: 2, awayScore: 1 },
            { home: "FISHERIES", away: "CBG", homeScore: 0, awayScore: 2 },
          ],
        },
        {
          round: "3rd Place",
          matches: [{ home: "FISHERIES", away: "BCH", homeScore: 0, awayScore: 2 }],
        },
        {
          round: "Final",
          matches: [{ home: "CBG", away: "PRE-MED", homeScore: 1, awayScore: 2 }],
        },
      ],
      medals: [
        { medal: "Gold", team: "PRE-MED" },
        { medal: "Silver", team: "CBG" },
        { medal: "Bronze", team: "BCH" },
      ],
    },
  ],
  chess: [
    {
      title: "Chess Male",
      meta: "Male knockout",
      rounds: [
        {
          round: "Quarter Final",
          matches: [
            { home: "BCH", away: "BTN", homeScore: 2, awayScore: 0 },
            { home: "PRE-MED", away: "MIC", homeScore: 2, awayScore: 1 },
            { home: "CBG", away: "ZLY", homeScore: 2, awayScore: 0 },
            { home: "MSM", away: "FISHERIES", homeScore: 0, awayScore: 2 },
          ],
        },
        {
          round: "Semi Final",
          matches: [
            { home: "BCH", away: "PRE-MED", homeScore: 2, awayScore: 0 },
            { home: "CBG", away: "FISHERIES", homeScore: 2, awayScore: 0 },
          ],
        },
        {
          round: "3rd Place",
          matches: [{ home: "PRE-MED", away: "FISHERIES", homeScore: 0, awayScore: 2 }],
        },
        {
          round: "Final",
          matches: [{ home: "BCH", away: "CBG", homeScore: 1, awayScore: 2 }],
        },
      ],
      medals: [
        { medal: "Gold", team: "CBG" },
        { medal: "Silver", team: "BCH" },
        { medal: "Bronze", team: "FISHERIES" },
      ],
    },
    {
      title: "Chess Female",
      meta: "Female knockout",
      rounds: [
        {
          round: "Quarter Final",
          matches: [
            { home: "BCH", away: "BTN", homeScore: 1, awayScore: 2 },
            { home: "PRE-MED", away: "MIC", homeScore: 2, awayScore: 0 },
            { home: "CBG", away: "ZLY", homeScore: 2, awayScore: 1 },
            { home: "MSM", away: "FISHERIES", homeScore: 2, awayScore: 0 },
          ],
        },
        {
          round: "Semi Final",
          matches: [
            { home: "BTN", away: "PRE-MED", homeScore: 1, awayScore: 2 },
            { home: "MSM", away: "CBG", homeScore: 1, awayScore: 2 },
          ],
        },
        {
          round: "3rd Place",
          matches: [{ home: "BTN", away: "MSM", note: "To be played on Wednesday" }],
        },
        {
          round: "Final",
          matches: [{ home: "CBG", away: "PRE-MED", note: "To be played on Wednesday" }],
        },
      ],
    },
  ],
  scrabble: [
    {
      title: "Scrabble Male",
      meta: "Male knockout",
      rounds: [
        {
          round: "Quarter Final",
          matches: [
            { home: "BCH", away: "BTN", winner: "BCH" },
            { home: "PRE-MED", away: "MIC", winner: "PRE-MED" },
            { home: "CBG", away: "ZLY", winner: "CBG" },
            { home: "MSM", away: "FISHERIES", winner: "FISHERIES" },
          ],
        },
        {
          round: "Semi Final",
          matches: [
            { home: "BCH", away: "PRE-MED", winner: "BCH" },
            { home: "CBG", away: "FISHERIES", winner: "CBG" },
          ],
        },
        {
          round: "3rd Place",
          matches: [{ home: "PRE-MED", away: "FISHERIES", note: "To be played on Wednesday" }],
        },
        {
          round: "Final",
          matches: [{ home: "BCH", away: "CBG", note: "To be played on Wednesday" }],
        },
      ],
    },
    {
      title: "Scrabble Female",
      meta: "Female knockout",
      rounds: [
        {
          round: "Quarter Final",
          matches: [
            { home: "BCH", away: "BTN", winner: "BCH" },
            { home: "PRE-MED", away: "MIC", winner: "MIC" },
            { home: "CBG", away: "ZLY", winner: "ZLY" },
            { home: "MSM", away: "FISHERIES", winner: "FISHERIES" },
          ],
        },
        {
          round: "Semi Final",
          matches: [
            { home: "BCH", away: "MIC", winner: "BCH" },
            { home: "FISHERIES", away: "ZLY", winner: "FISHERIES" },
          ],
        },
        {
          round: "3rd Place",
          matches: [{ home: "MIC", away: "ZLY", note: "To be played on Wednesday" }],
        },
        {
          round: "Final",
          matches: [{ home: "BCH", away: "FISHERIES", note: "To be played on Wednesday" }],
        },
      ],
    },
  ],
  "fifa-console": [
    {
      title: "FIFA Console",
      meta: "Console football knockout",
      rounds: [
        {
          round: "Quarter Final",
          matches: [
            { home: "BCH", away: "BTN", homeScore: 2, awayScore: 0 },
            { home: "PRE-MED", away: "MIC", homeScore: 0, awayScore: 2 },
            { home: "CBG", away: "ZLY", homeScore: 2, awayScore: 0 },
            { home: "MSM", away: "FISHERIES", homeScore: 0, awayScore: 2 },
          ],
        },
        {
          round: "Semi Final",
          matches: [
            { home: "MIC", away: "BCH", homeScore: 0, awayScore: 2 },
            { home: "CBG", away: "FISHERIES", homeScore: 2, awayScore: 1 },
          ],
        },
        {
          round: "3rd Place",
          matches: [{ home: "FISHERIES", away: "MIC", homeScore: 0, awayScore: 2 }],
        },
        {
          round: "Final",
          matches: [{ home: "CBG", away: "BCH", homeScore: 0, awayScore: 2 }],
        },
      ],
      medals: [
        { medal: "Gold", team: "BCH" },
        { medal: "Silver", team: "CBG" },
        { medal: "Bronze", team: "MIC" },
      ],
    },
  ],
  "pes-console": [
    {
      title: "PES Console",
      meta: "Console football knockout",
      rounds: [
        {
          round: "Quarter Final",
          matches: [
            { home: "BCH", away: "BTN", homeScore: 1, awayScore: 2 },
            { home: "PRE-MED", away: "MIC", homeScore: 2, awayScore: 1 },
            { home: "CBG", away: "ZLY", homeScore: 1, awayScore: 2 },
            { home: "MSM", away: "FISHERIES", homeScore: 2, awayScore: 0 },
          ],
        },
        {
          round: "Semi Final",
          matches: [
            { home: "BTN", away: "PRE-MED", homeScore: 2, awayScore: 0 },
            { home: "MSM", away: "ZLY", homeScore: 2, awayScore: 0 },
          ],
        },
        {
          round: "3rd Place",
          matches: [{ home: "PRE-MED", away: "ZLY", homeScore: 2, awayScore: 0 }],
        },
        {
          round: "Final",
          matches: [{ home: "BTN", away: "MSM", homeScore: 2, awayScore: 1 }],
        },
      ],
      medals: [
        { medal: "Gold", team: "BTN" },
        { medal: "Silver", team: "MSM" },
        { medal: "Bronze", team: "PRE-MED" },
      ],
    },
  ],
  "cod-mobile": [
    {
      title: "COD Mobile",
      meta: "Mobile team knockout",
      rounds: [
        {
          round: "Quarter Final",
          matches: [
            { home: "BCH", away: "BTN", homeScore: 2, awayScore: 0 },
            { home: "PRE-MED", away: "MIC", homeScore: 2, awayScore: 0 },
            { home: "CBG", away: "ZLY", homeScore: 2, awayScore: 0 },
            { home: "MSM", away: "FISHERIES", homeScore: 1, awayScore: 2 },
          ],
        },
        {
          round: "Semi Final",
          matches: [
            { home: "PRE-MED", away: "BCH", note: "To be played on Wednesday" },
            { home: "CBG", away: "FISHERIES", note: "To be played on Wednesday" },
          ],
        },
      ],
    },
  ],
};

const LUDO_RESULTS = INDOOR_RESULTS.ludo[0].rounds;
const LUDO_MEDAL_WINNERS = INDOOR_RESULTS.ludo[0].medals ?? [];

type FootballStanding = {
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

const MIXED_SPORTS: Record<
  MixedSportSlug,
  {
    name: string;
    description: string;
    potA: string[];
    potB: string[];
    notes: string[];
  }
> = {
  basketball: {
    name: "Basketball",
    description: "Mixed-gender knockout basketball with 10 representatives per department.",
    potA: ["MSM", "BCH", "CBG", "ZLY"],
    potB: ["MIC", "BTN", "PRE-MED", "FISHERIES"],
    notes: [
      "Mixed-gender team: 10 representatives per department, including coaches.",
      "8 departments compete across 3 days of action.",
      "Day 1: Prelims, 4 matches and 4 winners qualify.",
      "Day 2: Semi Finals, 2 matches and top 2 winners advance.",
      "Day 3: Grand Final.",
    ],
  },
  volleyball: {
    name: "Volleyball",
    description: "Mixed-gender knockout volleyball with 10 representatives per department.",
    potA: ["BCH", "CBG", "BTN", "FISHERIES"],
    potB: ["PRE-MED", "MIC", "MSM", "ZLY"],
    notes: [
      "Mixed-gender team: 10 representatives per department, including coaches.",
      "Competing as a mixed-gender team across all rounds.",
      "8 departments compete.",
      "Day 1: Prelims, 4 matches and 4 winners qualify.",
      "Day 2: Semi Finals, 2 matches and top 2 winners advance.",
      "Day 3: Grand Final.",
    ],
  },
};

const MIXED_SPORT_MATCHES: MixedSportMatch[] = Object.entries(MIXED_SPORTS).flatMap(
  ([sportSlug, sport]) =>
    sport.potA.map((home, index) => ({
      id: `${sportSlug}-prelim-${index + 1}`,
      sportSlug: sportSlug as MixedSportSlug,
      sportName: sport.name,
      stage: "Prelims",
      matchDay: "Day 1",
      home,
      away: sport.potB[index],
    })),
);

const TRACK_EVENTS: TrackEvent[] = [
  {
    id: "track-100m",
    name: "100m",
    category: "Male - Female",
    stage: "Heats before final",
    entry: "4 reps per department: 2 males and 2 females",
  },
  {
    id: "track-200m",
    name: "200m",
    category: "Male - Female",
    stage: "Heats before final",
    entry: "4 reps per department: 2 males and 2 females",
  },
  {
    id: "track-400m",
    name: "400m",
    category: "Male - Female",
    stage: "Heats before final",
    entry: "4 reps per department: 2 males and 2 females",
  },
  {
    id: "track-relay-male",
    name: "Male 4x100m Relay",
    category: "Male",
    stage: "Heats before final",
    entry: "4 male runners per department",
  },
  {
    id: "track-relay-female",
    name: "Female 4x100m Relay",
    category: "Female",
    stage: "Heats before final",
    entry: "4 female runners per department",
  },
  {
    id: "track-relay-mixed",
    name: "Mixed 4x100m Relay",
    category: "Mixed",
    stage: "Heats before final",
    entry: "2 males and 2 females per department",
  },
];

const TABLE_TENNIS_PAIRINGS = [
  ["MSM", "MIC"],
  ["BCH", "BTN"],
  ["CBG", "PRE-MED"],
  ["ZLY", "FISHERIES"],
] as const;

const TABLE_TENNIS_MATCHES: TableTennisMatch[] = (["Male", "Female"] as const).flatMap(
  (category) =>
    TABLE_TENNIS_PAIRINGS.map(([home, away], index) => ({
      id: `table-tennis-${category.toLowerCase()}-r1-${index + 1}`,
      category,
      stage: "Round 1",
      matchDay: "Knockout",
      home,
      away,
    })),
);

const FOOTBALL_MATCHDAY_DATE = "20/06/2026";
const FOOTBALL_VENUE = "ISL Football Pitch";

const MARATHON_RESULTS = [
  {
    category: "Females",
    rows: [
      { place: 1, name: "Shobowale Omoteniola", department: "BCH" },
      { place: 2, name: "Moses Zipporah", department: "MIC" },
      { place: 3, name: "Oyewo Oluwatobiloba", department: "BTN" },
    ],
  },
  {
    category: "Males",
    rows: [
      { place: 1, name: "Bakare Abdulquadri Folaranmi", department: "BTN" },
      { place: 2, name: "Balogun Basit", department: "FISHERIES" },
      { place: 3, name: "Oluwaleke Atolagbe John", department: "MSM" },
    ],
  },
];

const MALE_FOOTBALL_GROUPS = {
  "Group A": ["BTN", "CBG", "MSM", "MIC"],
  "Group B": ["ZLY", "BCH", "PRE-MED", "FISHERIES"],
} as const;

const FEMALE_FOOTBALL_POTS = {
  "Pot A": ["MSM", "ZLY", "FISHERIES", "BCH"],
  "Pot B": ["MIC", "BTN", "PRE-MED", "CBG"],
} as const;

const FOOTBALL_MATCHES: FootballMatch[] = [
  { id: "male-b-md1-2", gender: "male", group: "Group B", stage: "Group Stage", matchDay: "MD1", home: "PRE-MED", away: "FISHERIES", scheduledTime: "12:45 PM", venue: FOOTBALL_VENUE, startIso: "2026-06-20T12:45:00+01:00", durationMinutes: 60 },
  { id: "male-a-md1-2", gender: "male", group: "Group A", stage: "Group Stage", matchDay: "MD1", home: "MIC", away: "MSM", scheduledTime: "1:45 PM", venue: FOOTBALL_VENUE, startIso: "2026-06-20T13:45:00+01:00", durationMinutes: 60 },
  { id: "male-a-md1-1", gender: "male", group: "Group A", stage: "Group Stage", matchDay: "MD1", home: "BTN", away: "CBG", scheduledTime: "2:45 PM", venue: FOOTBALL_VENUE, startIso: "2026-06-20T14:45:00+01:00", durationMinutes: 60 },
  { id: "male-b-md1-1", gender: "male", group: "Group B", stage: "Group Stage", matchDay: "MD1", home: "ZLY", away: "BCH", scheduledTime: "3:45 PM", venue: FOOTBALL_VENUE, startIso: "2026-06-20T15:45:00+01:00", durationMinutes: 60 },
  { id: "male-a-md2-1", gender: "male", group: "Group A", stage: "Group Stage", matchDay: "MD2", home: "BTN", away: "MSM" },
  { id: "male-a-md2-2", gender: "male", group: "Group A", stage: "Group Stage", matchDay: "MD2", home: "CBG", away: "MIC" },
  { id: "male-a-md3-1", gender: "male", group: "Group A", stage: "Group Stage", matchDay: "MD3", home: "BTN", away: "MIC" },
  { id: "male-a-md3-2", gender: "male", group: "Group A", stage: "Group Stage", matchDay: "MD3", home: "CBG", away: "MSM" },
  { id: "male-b-md2-1", gender: "male", group: "Group B", stage: "Group Stage", matchDay: "MD2", home: "ZLY", away: "PRE-MED" },
  { id: "male-b-md2-2", gender: "male", group: "Group B", stage: "Group Stage", matchDay: "MD2", home: "BCH", away: "FISHERIES" },
  { id: "male-b-md3-1", gender: "male", group: "Group B", stage: "Group Stage", matchDay: "MD3", home: "ZLY", away: "FISHERIES" },
  { id: "male-b-md3-2", gender: "male", group: "Group B", stage: "Group Stage", matchDay: "MD3", home: "BCH", away: "PRE-MED" },
  { id: "female-ko-1", gender: "female", group: "Knockout", stage: "Quarter Final", matchDay: "K/O", home: "MIC", away: "MSM", scheduledTime: "11:00 AM", venue: FOOTBALL_VENUE, startIso: "2026-06-20T11:00:00+01:00", durationMinutes: 30 },
  { id: "female-ko-2", gender: "female", group: "Knockout", stage: "Quarter Final", matchDay: "K/O", home: "BTN", away: "ZLY", scheduledTime: "11:30 AM", venue: FOOTBALL_VENUE, startIso: "2026-06-20T11:30:00+01:00", durationMinutes: 30 },
  { id: "female-ko-3", gender: "female", group: "Knockout", stage: "Quarter Final", matchDay: "K/O", home: "FISHERIES", away: "PRE-MED", scheduledTime: "12:00 PM", venue: FOOTBALL_VENUE, startIso: "2026-06-20T12:00:00+01:00", durationMinutes: 30 },
  { id: "female-ko-4", gender: "female", group: "Knockout", stage: "Quarter Final", matchDay: "K/O", home: "CBG", away: "BCH", scheduledTime: "12:30 PM", venue: FOOTBALL_VENUE, startIso: "2026-06-20T12:30:00+01:00", durationMinutes: 30 },
];

function useCurrentMinute() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  return now;
}

function isFootballMatchLive(match: FootballMatch, now: Date, liveFixtures: Fixture[] = []) {
  if (liveFixtures.some((fixture) => isLiveFixtureForFootballMatch(fixture, match))) return true;
  if (!match.startIso) return false;
  const duration = match.durationMinutes ?? 60;
  const start = new Date(match.startIso).getTime();
  const end = start + duration * 60 * 1000;
  const current = now.getTime();
  return current >= start && current < end;
}

function isLiveFixtureForFootballMatch(fixture: Fixture, match: FootballMatch) {
  const expectedSport = match.gender === "female" ? "female-football" : "male-football";
  if (fixture.sport_slug !== expectedSport) return false;
  const home = fixture.home?.department_abbr;
  const away = fixture.away?.department_abbr;
  if (!home || !away) return true;
  return sameDepartment(home, match.home) && sameDepartment(away, match.away);
}

function sameDepartment(a: string, b: string) {
  return displayDepartmentAbbr(a) === displayDepartmentAbbr(b);
}

export default function SportDetail() {
  const { slug = "", matchId } = useParams();

  if (matchId && (slug === "male-football" || slug === "female-football")) {
    return <FootballMatchDetail matchId={matchId} />;
  }

  if (matchId && isMixedSportSlug(slug)) {
    return <MixedSportMatchDetail sportSlug={slug} matchId={matchId} />;
  }

  if (matchId && slug === "table-tennis") {
    return <TableTennisMatchDetail matchId={matchId} />;
  }

  if (slug === "indoor-games") {
    return <IndoorGamesDetail slug={slug} />;
  }

  const indoorGame = INDOOR_GAMES.find((game) => game.slug === slug);
  if (indoorGame) {
    return <IndoorGameDetail game={indoorGame} />;
  }

  if (slug === "male-football" || slug === "female-football") {
    return <FootballDetail initialGender={slug === "female-football" ? "female" : "male"} />;
  }

  if (isMixedSportSlug(slug)) {
    return <MixedSportDetail sportSlug={slug} />;
  }

  if (isTrackSportSlug(slug)) {
    return <TrackEventsDetail />;
  }

  if (slug === "table-tennis") {
    return <TableTennisDetail />;
  }

  if (slug === "marathon") {
    return <MarathonDetail />;
  }

  return <RegularSportDetail slug={slug} />;
}

function isMixedSportSlug(slug: string): slug is MixedSportSlug {
  return slug === "basketball" || slug === "volleyball";
}

function isTrackSportSlug(slug: string) {
  return slug === "track-events" || slug === "athletics";
}

function SportHero({
  title,
  subtitle,
  label,
  meta,
  icon,
  action,
  backTo = "/",
}: {
  title: string;
  subtitle?: string;
  label: string;
  meta: string;
  icon: ReactNode;
  action?: ReactNode;
  backTo?: string;
}) {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-white/12 bg-white/8 p-5 shadow-2xl ring-1 ring-white/8 sm:p-7">
      <div className="absolute -right-8 -top-10 text-[13rem] opacity-[0.05]" aria-hidden>
        {icon}
      </div>
      <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <Link to={backTo} className="text-xs font-bold uppercase tracking-[0.18em] text-white/55 hover:text-white">
            &lt;- {label}
          </Link>
          <p className="mt-5 text-sm font-bold uppercase tracking-[0.18em] text-brand-lime">
            {meta}
          </p>
          <h1 className="mt-2 font-display text-5xl font-bold leading-none sm:text-6xl">
            {title}
          </h1>
          {subtitle && <p className="mt-3 max-w-2xl text-sm text-white/68">{subtitle}</p>}
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>
    </section>
  );
}

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function indoorIconSlug(slug: string) {
  return slug === "fifa-console" || slug === "pes-console" ? "efootball" : slug;
}

function RegularSportDetail({ slug }: { slug: string }) {
  const [tab, setTab] = useState<Tab>("Overview");
  const following = useFollowStore((s) => s.isFollowing("sports", slug));
  const toggle = useFollowStore((s) => s.toggleSport);

  const sport = useQuery({ queryKey: ["sport", slug], queryFn: () => api.sport(slug) });
  const fixtures = useQuery({
    queryKey: ["fixtures", slug],
    queryFn: () => api.fixtures({ sport: slug }),
  });
  const standings = useQuery({
    queryKey: ["standings", slug],
    queryFn: () => api.standings(slug),
    enabled: tab === "Standings" || tab === "Overview",
  });

  const all = fixtures.data ?? [];
  const live = all.filter((f) => LIVE_STATUSES.includes(f.status));
  const upcoming = all.filter((f) => ["SCHEDULED", "WARMUP"].includes(f.status));
  const done = all.filter((f) => ["COMPLETED", "WALKOVER"].includes(f.status));

  // Only show tabs that apply to this sport.
  const tabs = TABS.filter((t) => t !== "Standings" || sport.data?.requires_table);

  return (
    <div className="space-y-7">
      <SportHero
        title={sport.data?.name ?? titleFromSlug(slug)}
        subtitle={sport.data?.description ?? undefined}
        label="Home"
        meta="Biolympics event"
        icon={sportIcon(slug)}
        action={
          <FollowButton following={following} onClick={() => toggle(slug)} label="sport" />
        }
      />

      <div className="flex gap-1 overflow-x-auto rounded-full bg-white/8 p-1 ring-1 ring-white/12">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              tab === t ? "bg-brand-lime text-brand-secondary" : "text-white/70 hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {fixtures.isLoading ? (
        <CardSkeleton count={4} />
      ) : tab === "Overview" ? (
        <div className="space-y-6">
          {live.length > 0 && <Group title="Live">{live.map((f) => <MatchCard key={f.id} fx={f} />)}</Group>}
          {upcoming.length > 0 ? (
            <Group title="Upcoming">{upcoming.slice(0, 6).map((f) => <MatchCard key={f.id} fx={f} />)}</Group>
          ) : (
            <EmptyState title="No upcoming fixtures." />
          )}
        </div>
      ) : tab === "Fixtures" ? (
        upcoming.length ? (
          <Group title="">{upcoming.map((f) => <MatchCard key={f.id} fx={f} />)}</Group>
        ) : (
          <EmptyState title="No fixtures scheduled." />
        )
      ) : tab === "Results" ? (
        done.length ? (
          <Group title="">{done.map((f) => <MatchCard key={f.id} fx={f} />)}</Group>
        ) : (
          <EmptyState title="No results yet." />
        )
      ) : (
        <div className="space-y-6">
          {(standings.data ?? []).length === 0 && <EmptyState title="No standings yet." />}
          {(standings.data ?? []).map((st) => (
            <StandingsTable key={st.group_name ?? "main"} standing={st} />
          ))}
        </div>
      )}
    </div>
  );
}

function IndoorGamesDetail({
  slug,
}: {
  slug: string;
}) {
  const following = useFollowStore((s) => s.isFollowing("sports", slug));
  const toggle = useFollowStore((s) => s.toggleSport);
  const departments = useQuery({ queryKey: ["departments"], queryFn: api.departments });
  const departmentByAbbr = new Map(
    (departments.data ?? []).map((department) => [department.abbreviation, department]),
  );

  return (
    <div className="space-y-7">
      <SportHero
        title="Indoor Games"
        subtitle="Every indoor discipline follows the same Pot A vs Pot B opening draw."
        label="Home"
        meta="Board - Console - Hall events"
        icon={sportIcon(slug)}
        action={<FollowButton following={following} onClick={() => toggle(slug)} label="sport" />}
      />

      <section className="hidden">
        <div className="absolute -right-10 -top-12 text-[12rem] opacity-[0.05]" aria-hidden>
          🎯
        </div>
        <div className="relative grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-lime">
              Pot draw
            </p>
            <h2 className="mt-2 font-display text-4xl font-bold leading-none sm:text-5xl">
              Pot A meets Pot B across every indoor game.
            </h2>
            <p className="mt-3 max-w-xl text-sm text-white/68">
              The matchups stay consistent so departments can track their head-to-heads across chess,
              scrabble, ludo, e-football, COD Mobile and other indoor events.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <PotCard title="Pot A" teams={["BCH", "PRE-MED", "CBG", "MSM"]} departments={departmentByAbbr} />
            <PotCard title="Pot B" teams={["BTN", "MIC", "ZLY", "FISHERIES"]} departments={departmentByAbbr} />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-lime">
              Indoor lineup
            </p>
            <h2 className="font-display text-3xl font-bold">Games</h2>
          </div>
          <span className="text-sm font-semibold text-white/60">{INDOOR_GAMES.length} events</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {INDOOR_GAMES.map((game) => (
            <Link
              key={game.slug}
              to={`/sports/${game.slug}`}
              state={{ from: "/sports/indoor-games" }}
              className="card-interactive relative min-h-32 overflow-hidden p-4"
            >
              <span className="text-3xl" aria-hidden>
                {sportIcon(indoorIconSlug(game.slug))}
              </span>
              <p className="mt-3 font-display text-2xl font-bold">{game.name}</p>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
                {game.note}
              </p>
              <span className="pointer-events-none absolute -bottom-6 -right-2 text-8xl opacity-[0.06]" aria-hidden>
                {sportIcon(indoorIconSlug(game.slug))}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function IndoorGameDetail({
  game,
}: {
  game: (typeof INDOOR_GAMES)[number];
}) {
  const resultGroups = INDOOR_RESULTS[game.slug] ?? [];
  const hasResults = resultGroups.length > 0;
  const [view, setView] = useState<IndoorView>(hasResults ? "results" : "fixtures");
  const following = useFollowStore((s) => s.isFollowing("sports", game.slug));
  const toggle = useFollowStore((s) => s.toggleSport);
  const departments = useQuery({ queryKey: ["departments"], queryFn: api.departments });
  const departmentByAbbr = new Map(
    (departments.data ?? []).map((department) => [department.abbreviation, department]),
  );
  const iconSlug = indoorIconSlug(game.slug);

  return (
    <div className="space-y-7">
      <SportHero
        title={game.name}
        subtitle={
          hasResults
            ? "Review the latest result flow from quarter finals through finals and pending matches."
            : "Indoor games use the Pot A vs Pot B fixture draw from the guide."
        }
        label="Indoor Games"
        meta="Indoor games"
        icon={sportIcon(iconSlug)}
        backTo="/sports/indoor-games"
        action={<FollowButton following={following} onClick={() => toggle(game.slug)} label="sport" />}
      />

      <section className="space-y-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-lime">
              Game centre
            </p>
            <h2 className="font-display text-3xl font-bold">{game.name}</h2>
            <p className="mt-1 max-w-2xl text-sm text-white/62">
              {hasResults
                ? "Completed and pending bracket updates for this indoor game."
                : "Fixtures show who faces who. Results will stay empty until scores are recorded."}
            </p>
          </div>

          <div className="flex gap-1 rounded-full bg-white/8 p-1 ring-1 ring-white/12">
            {(["fixtures", "results"] as IndoorView[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setView(option)}
                className={`min-w-28 rounded-full px-4 py-2 text-sm font-bold capitalize transition ${
                  view === option
                    ? "bg-brand-lime text-brand-secondary"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {view === "fixtures" ? (
          <IndoorGameFixtureCard game={game} departments={departmentByAbbr} />
        ) : hasResults ? (
          <IndoorResults groups={resultGroups} departments={departmentByAbbr} />
        ) : (
          <EmptyState title="No indoor results yet." hint="Completed results will appear here once the officials record them." />
        )}
      </section>
    </div>
  );
}

function PotCard({
  title,
  teams,
  departments,
}: {
  title: string;
  teams: string[];
  departments: Map<string, Department>;
}) {
  return (
    <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/12">
      <p className="mb-3 font-display text-2xl font-bold text-brand-lime">{title}</p>
      <div className="flex flex-wrap gap-2">
        {teams.map((abbr) => (
          <TeamChip
            key={abbr}
            abbr={abbr}
            color={departments.get(abbr)?.primary_color}
            name={departments.get(abbr)?.name}
            logoUrl={departments.get(abbr)?.logo_url}
          />
        ))}
      </div>
    </div>
  );
}

function TeamChip({
  abbr,
  color,
  name,
  logoUrl,
}: {
  abbr: string;
  color?: string;
  name?: string;
  logoUrl?: string | null;
}) {
  const resolvedLogo = getDepartmentLogoUrl(abbr, logoUrl);
  const displayAbbr = displayDepartmentAbbr(abbr);

  return (
    <span
      title={name}
      className="inline-flex min-h-10 items-center gap-2 rounded-full bg-white/8 px-3 py-2 text-sm font-bold text-white ring-1 ring-white/10"
    >
      <span
        className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full bg-white text-[9px] font-black text-white ring-1 ring-white/20"
        style={{ backgroundColor: resolvedLogo ? "#fff" : (color ?? "rgb(var(--c-lime))") }}
        aria-hidden
      >
        {resolvedLogo ? (
          <img src={resolvedLogo} alt="" className="h-full w-full object-contain p-0.5" decoding="async" />
        ) : (
          displayAbbr.slice(0, 3)
        )}
      </span>
      <span>{displayAbbr}</span>
    </span>
  );
}

function IndoorGameFixtureCard({
  game,
  departments,
}: {
  game: (typeof INDOOR_GAMES)[number];
  departments: Map<string, Department>;
}) {
  return (
    <article className="card relative overflow-hidden p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="font-display text-2xl font-bold">{game.name}</p>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
            Pot A vs Pot B
          </p>
        </div>
        <span className="text-3xl" aria-hidden>
          {sportIcon(game.slug)}
        </span>
      </div>

      <div className="space-y-2">
        {INDOOR_PAIRINGS.map(([home, away], index) => (
          <div
            key={`${game.slug}-${home}-${away}`}
            className="grid grid-cols-[2rem_minmax(0,1fr)] items-center gap-2 rounded-2xl bg-white/8 px-3 py-2 ring-1 ring-white/8"
          >
            <span className="font-display text-lg font-bold text-brand-lime">
              {index + 1}
            </span>
            <MatchupTeams
              home={home}
              away={away}
              homeColor={departments.get(home)?.primary_color}
              awayColor={departments.get(away)?.primary_color}
              homeName={departments.get(home)?.name}
              awayName={departments.get(away)?.name}
              homeLogo={departments.get(home)?.logo_url}
              awayLogo={departments.get(away)?.logo_url}
            />
          </div>
        ))}
      </div>
    </article>
  );
}

function IndoorResults({
  groups,
  departments,
}: {
  groups: IndoorResultGroup[];
  departments: Map<string, Department>;
}) {
  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <article key={group.title} className="card overflow-hidden p-4">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-lime">
                {group.meta}
              </p>
              <h3 className="mt-1 font-display text-3xl font-bold">{group.title}</h3>
            </div>
            {group.medals && (
              <span className="rounded-full bg-brand-accent/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-brand-accent">
                Podium confirmed
              </span>
            )}
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
            <div className="space-y-4">
              {group.rounds.map((round) => (
                <section key={`${group.title}-${round.round}`} className="rounded-2xl bg-white/6 p-3 ring-1 ring-white/8">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h4 className="font-display text-2xl font-bold">{round.round}</h4>
                    <span className="rounded-full bg-brand-lime/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-brand-lime">
                      {round.matches.some((match) => match.note) ? "Updated" : "Completed"}
                    </span>
                  </div>

                  <div className="grid gap-2 lg:grid-cols-2">
                    {round.matches.map((match) => (
                      <div
                        key={`${group.title}-${round.round}-${match.home}-${match.away}`}
                        className="rounded-2xl bg-white/8 px-3 py-3 ring-1 ring-white/8"
                      >
                        <MatchupTeams
                          home={match.home}
                          away={match.away}
                          homeColor={departments.get(match.home)?.primary_color}
                          awayColor={departments.get(match.away)?.primary_color}
                          homeName={departments.get(match.home)?.name}
                          awayName={departments.get(match.away)?.name}
                          homeLogo={departments.get(match.home)?.logo_url}
                          awayLogo={departments.get(match.away)?.logo_url}
                          center={indoorMatchCenter(match)}
                          centerClassName="font-display text-xl font-bold tabular-nums text-brand-lime"
                        />
                        {match.note && (
                          <p className="mt-2 text-center text-xs font-semibold uppercase tracking-[0.12em] text-white/45">
                            {match.note}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {group.medals ? (
              <IndoorMedalSummary medals={group.medals} departments={departments} title={group.title} />
            ) : (
              <aside className="rounded-2xl bg-white/8 p-4 ring-1 ring-white/10">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-lime">
                  Podium
                </p>
                <h4 className="mt-2 font-display text-2xl font-bold">Pending final results</h4>
                <p className="mt-2 text-sm leading-6 text-white/58">
                  Medal winners will show here after the final and third-place match are completed.
                </p>
              </aside>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

function indoorMatchCenter(match: IndoorMatchResult) {
  if (match.homeScore != null && match.awayScore != null) {
    return `${match.homeScore}-${match.awayScore}`;
  }
  if (match.winner) return `${match.winner} wins`;
  return "vs";
}

function IndoorMedalSummary({
  medals,
  departments,
  title,
}: {
  medals: IndoorMedalWinner[];
  departments: Map<string, Department>;
  title: string;
}) {
  return (
    <aside className="rounded-2xl bg-white/8 p-4 ring-1 ring-white/10">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-lime">
        {title} medal winners
      </p>
      <h4 className="mt-2 font-display text-2xl font-bold">Podium</h4>
      <div className="mt-4 space-y-3">
        {medals.map((row, index) => (
          <div
            key={`${title}-${row.medal}`}
            className="rounded-2xl bg-white/8 p-3 ring-1 ring-white/10"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/45">
                  {row.medal}
                </p>
                <TeamChip
                  abbr={row.team}
                  color={departments.get(row.team)?.primary_color}
                  name={departments.get(row.team)?.name}
                  logoUrl={departments.get(row.team)?.logo_url}
                />
              </div>
              <span className="text-3xl" aria-hidden>
                {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
              </span>
            </div>
            <p className="mt-3 text-xs font-semibold text-white/48">
              Player names pending
            </p>
          </div>
        ))}
      </div>
    </aside>
  );
}

export function LudoResults({ departments }: { departments: Map<string, Department> }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
      <section className="space-y-4">
        {LUDO_RESULTS.map((round) => (
          <article key={round.round} className="card overflow-hidden p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="font-display text-2xl font-bold">{round.round}</h3>
              <span className="rounded-full bg-brand-lime/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-brand-lime">
                Completed
              </span>
            </div>

            <div className="grid gap-2 lg:grid-cols-2">
              {round.matches.map((match) => (
                <div
                  key={`${round.round}-${match.home}-${match.away}`}
                  className="rounded-2xl bg-white/8 px-3 py-3 ring-1 ring-white/8"
                >
                  <MatchupTeams
                    home={match.home}
                    away={match.away}
                    homeColor={departments.get(match.home)?.primary_color}
                    awayColor={departments.get(match.away)?.primary_color}
                    homeName={departments.get(match.home)?.name}
                    awayName={departments.get(match.away)?.name}
                    homeLogo={departments.get(match.home)?.logo_url}
                    awayLogo={departments.get(match.away)?.logo_url}
                    center={`${match.homeScore}-${match.awayScore}`}
                    centerClassName="font-display text-2xl font-bold tabular-nums text-brand-lime"
                  />
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>

      <aside className="card h-fit p-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-lime">
          Ludo medal winners
        </p>
        <h3 className="mt-2 font-display text-3xl font-bold">Podium</h3>
        <div className="mt-4 space-y-3">
          {LUDO_MEDAL_WINNERS.map((row, index) => (
            <div
              key={row.medal}
              className="rounded-2xl bg-white/8 p-3 ring-1 ring-white/10"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/45">
                    {row.medal}
                  </p>
                  <TeamChip
                    abbr={row.team}
                    color={departments.get(row.team)?.primary_color}
                    name={departments.get(row.team)?.name}
                    logoUrl={departments.get(row.team)?.logo_url}
                  />
                </div>
                <span className="text-3xl" aria-hidden>
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                </span>
              </div>
              <p className="mt-3 text-xs font-semibold text-white/48">
                Player names pending
              </p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

function MixedSportDetail({ sportSlug }: { sportSlug: MixedSportSlug }) {
  const [view, setView] = useState<MixedSportView>("draw");
  const sport = MIXED_SPORTS[sportSlug];
  const following = useFollowStore((s) => s.isFollowing("sports", sportSlug));
  const toggle = useFollowStore((s) => s.toggleSport);
  const departments = useQuery({ queryKey: ["departments"], queryFn: api.departments });
  const departmentByAbbr = new Map(
    (departments.data ?? []).map((department) => [department.abbreviation, department]),
  );
  const matches = MIXED_SPORT_MATCHES.filter((match) => match.sportSlug === sportSlug);

  return (
    <div className="space-y-7">
      <SportHero
        title={sport.name}
        subtitle={sport.description}
        label="Home"
        meta="Mixed knockout"
        icon={sportIcon(sportSlug)}
        action={<FollowButton following={following} onClick={() => toggle(sportSlug)} label="sport" />}
      />

      <section className="space-y-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-lime">
              Competition centre
            </p>
            <h2 className="font-display text-3xl font-bold">{sport.name}</h2>
            <p className="mt-1 max-w-2xl text-sm text-white/62">
              Mixed-gender knockout draw. Pot A faces the corresponding Pot B team by position.
            </p>
          </div>

          <div className="flex gap-1 rounded-full bg-white/8 p-1 ring-1 ring-white/12">
            {(["draw", "fixtures", "results"] as MixedSportView[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setView(option)}
                className={`min-w-24 rounded-full px-4 py-2 text-sm font-bold capitalize transition ${
                  view === option
                    ? "bg-brand-lime text-brand-secondary"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {view === "draw" ? (
          <MixedSportDraw sport={sport} departments={departmentByAbbr} />
        ) : view === "fixtures" ? (
          <MixedSportFixtures matches={matches} departments={departmentByAbbr} />
        ) : (
          <EmptyState title={`No ${sport.name.toLowerCase()} results yet.`} hint="Live and completed matches will appear here once play begins." />
        )}
      </section>
    </div>
  );
}

function MixedSportDraw({
  sport,
  departments,
}: {
  sport: (typeof MIXED_SPORTS)[MixedSportSlug];
  departments: Map<string, Department>;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <PotCard title="Pot A" teams={sport.potA} departments={departments} />
        <PotCard title="Pot B" teams={sport.potB} departments={departments} />
      </div>

      <article className="card p-5">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-lime">
          Format
        </p>
        <h3 className="mt-2 font-display text-3xl font-bold">3-day knockout path</h3>
        <div className="mt-4 grid gap-3">
          {sport.notes.map((note, index) => (
            <div key={note} className="flex gap-3 rounded-2xl bg-white/8 p-3 ring-1 ring-white/10">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-lime font-display font-bold text-brand-secondary">
                {index + 1}
              </span>
              <p className="text-sm text-white/72">{note}</p>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

function MixedSportFixtures({
  matches,
  departments,
}: {
  matches: MixedSportMatch[];
  departments: Map<string, Department>;
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {matches.map((match) => (
        <MixedSportMatchCard key={match.id} match={match} departments={departments} />
      ))}
    </div>
  );
}

function MixedSportMatchCard({
  match,
  departments,
}: {
  match: MixedSportMatch;
  departments: Map<string, Department>;
}) {
  return (
    <Link
      to={`/sports/${match.sportSlug}/matches/${match.id}`}
      className="card relative block w-full overflow-hidden p-4 text-left transition hover:-translate-y-0.5 hover:ring-brand-lime/50"
    >
      <span className="absolute -right-5 -top-8 text-8xl opacity-[0.06]" aria-hidden>
        {sportIcon(match.sportSlug)}
      </span>
      <div className="relative mb-3 flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.14em] text-white/50">
        <span>{match.stage}</span>
        <span className="rounded-full bg-white/10 px-2 py-1 text-brand-lime">{match.matchDay}</span>
      </div>
      <div className="relative">
        <MatchupTeams
          home={match.home}
          away={match.away}
          homeColor={departments.get(match.home)?.primary_color}
          awayColor={departments.get(match.away)?.primary_color}
          homeName={departments.get(match.home)?.name}
          awayName={departments.get(match.away)?.name}
          homeLogo={departments.get(match.home)?.logo_url}
          awayLogo={departments.get(match.away)?.logo_url}
          center={<span className="rounded-full bg-white/10 px-3 py-1 font-display text-xl font-bold">vs</span>}
          centerClassName=""
        />
      </div>
      <p className="relative mt-3 text-xs font-semibold text-white/48">
        View match details
      </p>
    </Link>
  );
}

function MixedSportMatchDetail({
  sportSlug,
  matchId,
}: {
  sportSlug: MixedSportSlug;
  matchId: string;
}) {
  const sport = MIXED_SPORTS[sportSlug];
  const match = MIXED_SPORT_MATCHES.find((item) => item.id === matchId && item.sportSlug === sportSlug) ?? null;
  const departments = useQuery({ queryKey: ["departments"], queryFn: api.departments });
  const departmentByAbbr = new Map(
    (departments.data ?? []).map((department) => [department.abbreviation, department]),
  );

  if (!match) {
    return (
      <div className="space-y-7">
        <SportHero
          title="Match not found"
          subtitle={`This ${sport.name.toLowerCase()} fixture could not be found in the current guide.`}
          label={sport.name}
          meta={sport.name}
          icon={sportIcon(sportSlug)}
          backTo={`/sports/${sportSlug}`}
        />
        <EmptyState title="No match details available." hint={`Return to ${sport.name} fixtures and choose another match.`} />
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <SportHero
        title={`${match.home} vs ${match.away}`}
        subtitle="Scoreline, key moments and highlights will live here once the match is played."
        label={sport.name}
        meta={`${sport.name} - ${match.stage} - ${match.matchDay}`}
        icon={sportIcon(sportSlug)}
        backTo={`/sports/${sportSlug}`}
      />

      <MixedMatchDetailPanel match={match} departments={departmentByAbbr} />
    </div>
  );
}

function MixedMatchDetailPanel({
  match,
  departments,
}: {
  match: MixedSportMatch;
  departments: Map<string, Department>;
}) {
  return (
    <aside className="card overflow-hidden p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-lime">
            Match details
          </p>
          <p className="font-display text-2xl font-bold">{match.stage} - {match.matchDay}</p>
        </div>
        <span className="text-4xl" aria-hidden>{sportIcon(match.sportSlug)}</span>
      </div>

      <div className="rounded-3xl bg-white/8 p-4 ring-1 ring-white/10">
        <MatchupTeams
          home={match.home}
          away={match.away}
          homeColor={departments.get(match.home)?.primary_color}
          awayColor={departments.get(match.away)?.primary_color}
          homeName={departments.get(match.home)?.name}
          awayName={departments.get(match.away)?.name}
          homeLogo={departments.get(match.home)?.logo_url}
          awayLogo={departments.get(match.away)?.logo_url}
          center={<span className="font-display text-4xl font-bold text-brand-lime">-</span>}
          centerClassName=""
        />
        <p className="mt-3 text-center text-xs font-bold uppercase tracking-[0.16em] text-white/45">
          Scoreline pending
        </p>
      </div>

      <div className="mt-4 grid gap-3">
        <DetailBlock title="Scorers" body="No points recorded yet." />
        <DetailBlock title="Key moments" body="Match notes will be added after play." />
        <DetailBlock title="Highlights" body="Highlights will be added after match media is available." />
      </div>
    </aside>
  );
}

function TableTennisDetail() {
  const [view, setView] = useState<TableTennisView>("format");
  const following = useFollowStore((s) => s.isFollowing("sports", "table-tennis"));
  const toggle = useFollowStore((s) => s.toggleSport);
  const departments = useQuery({ queryKey: ["departments"], queryFn: api.departments });
  const departmentByAbbr = new Map(
    (departments.data ?? []).map((department) => [department.abbreviation, department]),
  );

  return (
    <div className="space-y-7">
      <SportHero
        title="Table Tennis"
        subtitle="1 male and 1 female representative from each department, played as knockout brackets."
        label="Home"
        meta="Male - Female knockout"
        icon={sportIcon("table-tennis")}
        action={<FollowButton following={following} onClick={() => toggle("table-tennis")} label="sport" />}
      />

      <section className="space-y-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-lime">
              Table tennis centre
            </p>
            <h2 className="font-display text-3xl font-bold">Knockout brackets</h2>
            <p className="mt-1 max-w-2xl text-sm text-white/62">
              8 male entries and 8 female entries. Round 1 produces 4 winners before semi finals and the grand final.
            </p>
          </div>

          <div className="flex gap-1 rounded-full bg-white/8 p-1 ring-1 ring-white/12">
            {(["format", "fixtures", "results"] as TableTennisView[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setView(option)}
                className={`min-w-24 rounded-full px-4 py-2 text-sm font-bold capitalize transition ${
                  view === option
                    ? "bg-brand-lime text-brand-secondary"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {view === "format" ? (
          <TableTennisFormat />
        ) : view === "fixtures" ? (
          <TableTennisFixtures matches={TABLE_TENNIS_MATCHES} departments={departmentByAbbr} />
        ) : (
          <EmptyState title="No table tennis results yet." hint="Completed match results will appear here once recorded." />
        )}
      </section>
    </div>
  );
}

function TableTennisFormat() {
  const formatNotes = [
    "1 representative per gender from each department.",
    "8 departments produce 8 male entries and 8 female entries.",
    "Round 1: Knockout, with 4 winners advancing in each bracket.",
    "Semi Finals: 2 matches per bracket.",
    "Grand Final: Champion crowned.",
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
      <article className="card p-5">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-lime">
          Format
        </p>
        <h3 className="mt-2 font-display text-3xl font-bold">Male and female knockout brackets</h3>
        <div className="mt-4 grid gap-3">
          {formatNotes.map((note, index) => (
            <div key={note} className="flex gap-3 rounded-2xl bg-white/8 p-3 ring-1 ring-white/10">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-lime font-display font-bold text-brand-secondary">
                {index + 1}
              </span>
              <p className="text-sm text-white/72">{note}</p>
            </div>
          ))}
        </div>
      </article>

      <article className="card relative overflow-hidden p-5">
        <span className="absolute -right-5 -top-8 text-8xl opacity-[0.06]" aria-hidden>
          {sportIcon("table-tennis")}
        </span>
        <p className="relative text-sm font-bold uppercase tracking-[0.18em] text-brand-lime">
          Brackets
        </p>
        <h3 className="relative mt-2 font-display text-3xl font-bold">Round 1 to final</h3>
        <div className="relative mt-4 grid gap-3">
          {["Round 1", "Semi Finals", "Grand Final"].map((stage, index) => (
            <div key={stage} className="rounded-2xl bg-white/8 p-4 ring-1 ring-white/10">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/45">
                Stage {index + 1}
              </p>
              <p className="mt-1 font-display text-2xl font-bold">{stage}</p>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

function TableTennisFixtures({
  matches,
  departments,
}: {
  matches: TableTennisMatch[];
  departments: Map<string, Department>;
}) {
  return (
    <div className="space-y-5">
      {(["Male", "Female"] as const).map((category) => (
        <section key={category}>
          <h3 className="mb-3 flex items-center gap-2 font-display text-2xl font-bold">
            <span className="h-6 w-1 rounded-full bg-brand-lime" aria-hidden />
            {category} Round 1
          </h3>
          <div className="grid gap-3 lg:grid-cols-2">
            {matches
              .filter((match) => match.category === category)
              .map((match) => (
                <TableTennisMatchCard key={match.id} match={match} departments={departments} />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function TableTennisMatchCard({
  match,
  departments,
}: {
  match: TableTennisMatch;
  departments: Map<string, Department>;
}) {
  return (
    <Link
      to={`/sports/table-tennis/matches/${match.id}`}
      className="card relative block w-full overflow-hidden p-4 text-left transition hover:-translate-y-0.5 hover:ring-brand-lime/50"
    >
      <span className="absolute -right-5 -top-8 text-8xl opacity-[0.06]" aria-hidden>
        {sportIcon("table-tennis")}
      </span>
      <div className="relative mb-3 flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.14em] text-white/50">
        <span>{match.category}</span>
        <span className="rounded-full bg-white/10 px-2 py-1 text-brand-lime">{match.stage}</span>
      </div>
      <div className="relative">
        <MatchupTeams
          home={match.home}
          away={match.away}
          homeColor={departments.get(match.home)?.primary_color}
          awayColor={departments.get(match.away)?.primary_color}
          homeName={departments.get(match.home)?.name}
          awayName={departments.get(match.away)?.name}
          homeLogo={departments.get(match.home)?.logo_url}
          awayLogo={departments.get(match.away)?.logo_url}
          center={<span className="rounded-full bg-white/10 px-3 py-1 font-display text-xl font-bold">vs</span>}
          centerClassName=""
        />
      </div>
      <p className="relative mt-3 text-xs font-semibold text-white/48">
        View match details
      </p>
    </Link>
  );
}

function TableTennisMatchDetail({ matchId }: { matchId: string }) {
  const match = TABLE_TENNIS_MATCHES.find((item) => item.id === matchId) ?? null;
  const departments = useQuery({ queryKey: ["departments"], queryFn: api.departments });
  const departmentByAbbr = new Map(
    (departments.data ?? []).map((department) => [department.abbreviation, department]),
  );

  if (!match) {
    return (
      <div className="space-y-7">
        <SportHero
          title="Match not found"
          subtitle="This table tennis fixture could not be found in the current guide."
          label="Table Tennis"
          meta="Table Tennis"
          icon={sportIcon("table-tennis")}
          backTo="/sports/table-tennis"
        />
        <EmptyState title="No match details available." hint="Return to Table Tennis fixtures and choose another match." />
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <SportHero
        title={`${match.home} vs ${match.away}`}
        subtitle="Scoreline and highlights will live here once the match is played."
        label="Table Tennis"
        meta={`${match.category} - ${match.stage}`}
        icon={sportIcon("table-tennis")}
        backTo="/sports/table-tennis"
      />

      <TableTennisMatchDetailPanel match={match} departments={departmentByAbbr} />
    </div>
  );
}

function TableTennisMatchDetailPanel({
  match,
  departments,
}: {
  match: TableTennisMatch;
  departments: Map<string, Department>;
}) {
  return (
    <aside className="card overflow-hidden p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-lime">
            Match details
          </p>
          <p className="font-display text-2xl font-bold">{match.category} - {match.stage}</p>
        </div>
        <span className="text-4xl" aria-hidden>{sportIcon("table-tennis")}</span>
      </div>

      <div className="rounded-3xl bg-white/8 p-4 ring-1 ring-white/10">
        <MatchupTeams
          home={match.home}
          away={match.away}
          homeColor={departments.get(match.home)?.primary_color}
          awayColor={departments.get(match.away)?.primary_color}
          homeName={departments.get(match.home)?.name}
          awayName={departments.get(match.away)?.name}
          homeLogo={departments.get(match.home)?.logo_url}
          awayLogo={departments.get(match.away)?.logo_url}
          center={<span className="font-display text-4xl font-bold text-brand-lime">-</span>}
          centerClassName=""
        />
        <p className="mt-3 text-center text-xs font-bold uppercase tracking-[0.16em] text-white/45">
          Scoreline pending
        </p>
      </div>

      <div className="mt-4 grid gap-3">
        <DetailBlock title="Winner" body="No winner recorded yet." />
        <DetailBlock title="Set scores" body="Set-by-set scores will appear after the match." />
        <DetailBlock title="Highlights" body="Highlights will be added after match media is available." />
      </div>
    </aside>
  );
}

function MarathonDetail() {
  const following = useFollowStore((s) => s.isFollowing("sports", "marathon"));
  const toggle = useFollowStore((s) => s.toggleSport);

  function shareMarathon() {
    const url = `${window.location.origin}/sports/marathon`;
    navigator.share?.({
      title: "ULLSSA Marathon 2026",
      text: "The ULLSSA Marathon is live now. Registration has closed.",
      url,
    }).catch(() => {});
  }

  return (
    <div className="space-y-7">
      <SportHero
        title="ULLSSA Marathon 2026"
        subtitle="The Dean's Games marathon is live now. Registration has closed, but race details remain available for participants and supporters."
        label="Home"
        meta="Live now - registration closed"
        icon={sportIcon("marathon")}
        action={
          <div className="flex flex-wrap gap-2">
            <span className="live-glow rounded-full bg-danger/15 px-4 py-2 text-sm font-bold uppercase tracking-[0.12em] text-danger ring-1 ring-danger/25">
              Live now
            </span>
            <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold uppercase tracking-[0.12em] text-white/68 ring-1 ring-white/15">
              Registration closed
            </span>
            <FollowButton following={following} onClick={() => toggle("marathon")} label="sport" />
          </div>
        }
      />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <article className="card relative overflow-hidden p-5">
          <span className="absolute -right-5 -top-8 text-8xl opacity-[0.06]" aria-hidden>
            {sportIcon("marathon")}
          </span>
          <p className="relative text-sm font-bold uppercase tracking-[0.18em] text-brand-lime">
            Race live now
          </p>
          <h2 className="relative mt-2 font-display text-4xl font-bold">
            Saturday, June 20
          </h2>
          <p className="relative mt-2 max-w-xl text-sm leading-6 text-white/66">
            The marathon is currently live. Registration has closed, and participants can
            use this page to confirm the starting point and race categories.
          </p>
          <div className="relative mt-5 grid gap-3 sm:grid-cols-2">
            <MarathonInfoCard label="Start time" value="6 AM prompt" />
            <MarathonInfoCard label="Start point" value="Faculty of Sciences Complex" />
            <MarathonInfoCard label="Male race" value="7.4KM" />
            <MarathonInfoCard label="Female race" value="3.7KM" />
          </div>

          <div className="relative mt-5 rounded-2xl border border-brand-accent/30 bg-brand-accent/12 px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] text-brand-accent">
            Marathon results are now available. Registration has closed.
          </div>

          <span className="relative mt-5 inline-flex w-full justify-center rounded-full bg-white/10 px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white/60 ring-1 ring-white/15 sm:w-auto">
            Registration closed
          </span>
          <button
            type="button"
            className="btn-ghost relative mt-3 w-full justify-center sm:ml-2 sm:w-auto"
            onClick={shareMarathon}
          >
            Share marathon page
          </button>
        </article>

        <article className="card p-5">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-lime">
            Why everyone should see this
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold">
            Run, represent, support
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-6 text-white/68">
            <p>
              Lace up and get ready. The ULLSSA Marathon 2026 is one of the headline moments
              of the Dean&apos;s Games, built for endurance, wellness and department pride.
            </p>
            <p>
              Whether you are running competitively or cheering your department on, this is the
              easiest place to stay connected to the event details.
            </p>
          </div>
          <div className="mt-5 grid gap-3">
            {["Marathon live now", "Registration closed", "Represent your department", "Run with the faculty"].map((item) => (
              <div key={item} className="rounded-2xl bg-white/8 p-3 font-bold ring-1 ring-white/10">
                {item}
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {MARATHON_RESULTS.map((group) => (
          <MarathonResultCard key={group.category} category={group.category} rows={group.rows} />
        ))}
      </section>
    </div>
  );
}

function MarathonResultCard({
  category,
  rows,
}: {
  category: string;
  rows: { place: number; name: string; department: string }[];
}) {
  return (
    <article className="card overflow-hidden p-5">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-lime">
        Marathon podium
      </p>
      <h2 className="mt-2 font-display text-3xl font-bold">{category}</h2>
      <div className="mt-5 space-y-3">
        {rows.map((row) => (
          <div key={`${category}-${row.place}`} className="flex items-center gap-3 rounded-2xl bg-white/8 p-3 ring-1 ring-white/10">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-accent text-lg font-black text-brand-secondary">
              {row.place}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-display text-xl font-bold text-white">
                {row.name}
              </span>
              <span className="mt-0.5 block text-xs font-bold uppercase tracking-[0.14em] text-white/48">
                {displayDepartmentAbbr(row.department)}
              </span>
            </span>
            <span
              className={`medal-badge ${row.place === 1 ? "medal-badge-gold" : row.place === 2 ? "medal-badge-silver" : "medal-badge-bronze"}`}
              aria-label={`${row.place === 1 ? "Gold" : row.place === 2 ? "Silver" : "Bronze"} medal`}
              role="img"
            >
              {row.place}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}

function MarathonInfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/8 p-4 ring-1 ring-white/10">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function TrackEventsDetail() {
  const [view, setView] = useState<TrackView>("events");
  const following = useFollowStore((s) => s.isFollowing("sports", "track-events"));
  const toggle = useFollowStore((s) => s.toggleSport);

  return (
    <div className="space-y-7">
      <SportHero
        title="Track Events"
        subtitle="100m, 200m, 400m and 4x100m relay races with heats before every final."
        label="Home"
        meta="Heats - Finals - Relays"
        icon={sportIcon("athletics")}
        action={<FollowButton following={following} onClick={() => toggle("track-events")} label="sport" />}
      />

      <section className="space-y-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-lime">
              Track centre
            </p>
            <h2 className="font-display text-3xl font-bold">Race programme</h2>
            <p className="mt-1 max-w-2xl text-sm text-white/62">
              Heats act as prelims for every track event before the male, female and mixed finals.
            </p>
          </div>

          <div className="flex gap-1 rounded-full bg-white/8 p-1 ring-1 ring-white/12">
            {(["events", "fixtures", "results"] as TrackView[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setView(option)}
                className={`min-w-24 rounded-full px-4 py-2 text-sm font-bold capitalize transition ${
                  view === option
                    ? "bg-brand-lime text-brand-secondary"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {view === "events" ? (
          <TrackEventsOverview />
        ) : view === "fixtures" ? (
          <TrackFixtures />
        ) : (
          <EmptyState title="No track results yet." hint="Heat and final results will appear here once races are recorded." />
        )}
      </section>
    </div>
  );
}

function TrackEventsOverview() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <div className="grid gap-3 sm:grid-cols-2">
        {TRACK_EVENTS.map((event) => (
          <article key={event.id} className="card relative overflow-hidden p-4">
            <span className="absolute -right-4 -top-5 text-7xl opacity-[0.06]" aria-hidden>
              {sportIcon("athletics")}
            </span>
            <p className="relative text-xs font-bold uppercase tracking-[0.16em] text-brand-lime">
              {event.category}
            </p>
            <h3 className="relative mt-2 font-display text-3xl font-bold">{event.name}</h3>
            <p className="relative mt-2 text-sm text-white/62">{event.entry}</p>
          </article>
        ))}
      </div>

      <article className="card p-5">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-lime">
          Format
        </p>
        <h3 className="mt-2 font-display text-3xl font-bold">Heats before all finals</h3>
        <div className="mt-4 grid gap-3">
          {[
            "Events: 100m, 200m, 400m and 4x100m Relay.",
            "100m, 200m and 400m: 4 reps per department, 2 males and 2 females.",
            "Relay categories: Male 4x100m, Female 4x100m and Mixed 4x100m.",
            "Mixed relay teams run with 2 males and 2 females.",
            "Final races are split into male, female and mixed categories.",
          ].map((note, index) => (
            <div key={note} className="flex gap-3 rounded-2xl bg-white/8 p-3 ring-1 ring-white/10">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-lime font-display font-bold text-brand-secondary">
                {index + 1}
              </span>
              <p className="text-sm text-white/72">{note}</p>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

function TrackFixtures() {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {TRACK_EVENTS.map((event) => (
        <article key={event.id} className="card relative overflow-hidden p-4">
          <span className="absolute -right-5 -top-8 text-8xl opacity-[0.06]" aria-hidden>
            {sportIcon("athletics")}
          </span>
          <div className="relative mb-4 flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.14em] text-white/50">
            <span>{event.category}</span>
            <span className="rounded-full bg-white/10 px-2 py-1 text-brand-lime">Heats</span>
          </div>
          <h3 className="relative font-display text-3xl font-bold">{event.name}</h3>
          <p className="relative mt-2 text-sm text-white/62">{event.stage}</p>
          <p className="relative mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-white/48">
            Finals follow after qualifiers are confirmed
          </p>
        </article>
      ))}
    </div>
  );
}

function FootballDetail({ initialGender }: { initialGender: FootballGender }) {
  const [gender, setGender] = useState<FootballGender>(initialGender);
  const [view, setView] = useState<FootballView>("table");
  const departments = useQuery({ queryKey: ["departments"], queryFn: api.departments });
  const liveFixtures = useQuery({ queryKey: ["live"], queryFn: api.liveFixtures, refetchInterval: 30000 });
  const departmentByAbbr = new Map(
    (departments.data ?? []).map((department) => [department.abbreviation, department]),
  );

  const matches = FOOTBALL_MATCHES.filter((match) => match.gender === gender);
  const standings = gender === "male" ? createFootballStandings(MALE_FOOTBALL_GROUPS) : {};
  const now = useCurrentMinute();

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-[28px] border border-white/12 bg-white/8 p-5 shadow-2xl ring-1 ring-white/8 sm:p-7">
        <div className="absolute -right-8 -top-10 text-[13rem] opacity-[0.05]" aria-hidden>
          ⚽
        </div>
        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <Link to="/" className="text-xs font-bold uppercase tracking-[0.18em] text-white/55 hover:text-white">
              &lt;- Home
            </Link>
            <p className="mt-5 text-sm font-bold uppercase tracking-[0.18em] text-brand-lime">
              Male · Female
            </p>
            <h1 className="mt-2 font-display text-5xl font-bold leading-none sm:text-6xl">
              Football
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-white/68">
              Male football follows the ULSSA Group A/B round-robin guide. Female football opens
              with the Pot A vs Pot B knockout draw.
            </p>
          </div>

          <div className="flex gap-1 rounded-full bg-white/8 p-1 ring-1 ring-white/12">
            {(["male", "female"] as FootballGender[]).map((option) => (
              <button
                key={option}
                onClick={() => {
                  setGender(option);
                  setView("table");
                }}
                className={`rounded-full px-5 py-2 text-sm font-bold capitalize transition ${
                  gender === option
                    ? "bg-brand-lime text-brand-secondary"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-lime">
              Competition centre
            </p>
            <h2 className="font-display text-3xl font-bold">
              {gender === "male" ? "Male football" : "Female football"}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-white/62">
              Table tracks points, goal difference and form from completed group matches. Fixtures
              shows the next pairings, while Results stays empty until a match is live or finished.
            </p>
          </div>

          <div className="flex rounded-full bg-white/8 p-1 ring-1 ring-white/12">
            {(["table", "fixtures", "results"] as FootballView[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setView(option);
                }}
                className={`min-w-24 rounded-full px-4 py-2 text-sm font-bold capitalize transition ${
                  view === option
                    ? "bg-brand-lime text-brand-secondary"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <FootballMatchdayBriefing gender={gender} />

        {view === "table" ? (
          gender === "male" ? (
            <div className="space-y-5">
              {Object.entries(standings).map(([group, rows]) => (
                <FootballStandingsTable
                  key={group}
                  group={group}
                  rows={rows}
                  departments={departmentByAbbr}
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {Object.entries(FEMALE_FOOTBALL_POTS).map(([title, teams]) => (
                <PotCard key={title} title={title} teams={[...teams]} departments={departmentByAbbr} />
              ))}
              <div className="card p-5 lg:col-span-2">
                <p className="font-display text-2xl font-bold">No female group table yet</p>
                <p className="mt-2 text-sm text-white/62">
                  Female football starts as a knockout draw, so points and goal difference will not
                  be tracked like the male group stage.
                </p>
              </div>
            </div>
          )
        ) : view === "fixtures" ? (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_24rem]">
            <div className="space-y-5">
              <FootballFixturesList
                matches={matches}
                departments={departmentByAbbr}
                now={now}
                liveFixtures={liveFixtures.data ?? []}
              />
            </div>
          </div>
        ) : (
          <EmptyState title="No football results yet." hint="Live and completed matches will appear here once play begins." />
        )}
      </section>
    </div>
  );
}

function FootballMatchDetail({ matchId }: { matchId: string }) {
  const match = FOOTBALL_MATCHES.find((item) => item.id === matchId) ?? null;
  const departments = useQuery({ queryKey: ["departments"], queryFn: api.departments });
  const departmentByAbbr = new Map(
    (departments.data ?? []).map((department) => [department.abbreviation, department]),
  );
  const sportSlug = match?.gender === "female" ? "female-football" : "male-football";

  if (!match) {
    return (
      <div className="space-y-7">
        <SportHero
          title="Match not found"
          subtitle="This football fixture could not be found in the current guide."
          label="Home"
          meta="Football"
          icon={sportIcon("football")}
        />
        <EmptyState title="No match details available." hint="Return to the football fixtures and choose another match." />
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <SportHero
        title={`${displayDepartmentAbbr(match.home)} vs ${displayDepartmentAbbr(match.away)}`}
        subtitle={`${match.scheduledTime ?? "Time TBA"} at ${match.venue ?? "Venue TBA"}. Scoreline, goal scorers, assists and highlights will live here once the game is played.`}
        label="Home"
        meta={`${match.gender} football - ${match.stage} - ${match.matchDay}`}
        icon={sportIcon("football")}
        action={
          <Link
            to={`/sports/${sportSlug}`}
            className="btn-ghost whitespace-nowrap"
          >
            Back to football
          </Link>
        }
      />

      <MatchDetailPanel match={match} departments={departmentByAbbr} className="" />
    </div>
  );
}

function createFootballStandings(groups: typeof MALE_FOOTBALL_GROUPS) {
  return Object.fromEntries(
    Object.entries(groups).map(([group, teams]) => [
      group,
      teams.map((team) => ({
        team,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      })),
    ]),
  ) as Record<string, FootballStanding[]>;
}

function FootballFixturesList({
  matches,
  departments,
  now,
  liveFixtures,
}: {
  matches: FootballMatch[];
  departments: Map<string, Department>;
  now: Date;
  liveFixtures: Fixture[];
}) {
  return (
    <section className="space-y-3">
      <div className="grid gap-3 xl:grid-cols-2">
        {matches.map((match) => (
          <FootballMatchCard key={match.id} match={match} departments={departments} now={now} liveFixtures={liveFixtures} />
        ))}
      </div>
    </section>
  );
}

function FootballMatchdayBriefing({ gender }: { gender: FootballGender }) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-brand-lime/25 bg-brand-lime/10 p-4 ring-1 ring-brand-lime/10">
      <span className="absolute -right-4 -top-8 text-7xl opacity-[0.08]" aria-hidden>
        {sportIcon("football")}
      </span>
      <div className="relative flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-lime">
            {gender === "male" ? "Male football matchday" : "Female knockout stage"}
          </p>
          <h3 className="mt-1 font-display text-2xl font-bold text-white">
            {gender === "male"
              ? "Group stage kicks off at the ISL Football Pitch"
              : "The queens are set to battle for glory"}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-white/64">
            {gender === "male"
              ? "Four group-stage games are lined up today, starting with PRE-MED vs FSH."
              : "Female Football Knockout Stage kicks off on Saturday 20th. One win moves each team closer to the crown."}
          </p>
        </div>
        <div className="grid min-w-48 gap-1 rounded-xl bg-black/15 p-3 text-sm ring-1 ring-white/10">
          <span className="font-bold text-white">{FOOTBALL_MATCHDAY_DATE}</span>
          <span className="text-white/62">{FOOTBALL_VENUE}</span>
        </div>
      </div>
    </article>
  );
}

function FootballStandingsTable({
  group,
  rows,
  departments,
}: {
  group: string;
  rows: FootballStanding[];
  departments: Map<string, Department>;
}) {
  return (
    <article className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h3 className="font-display text-2xl font-bold">{group}</h3>
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-brand-lime">
          Football table
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="text-xs uppercase tracking-[0.14em] text-white/50">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Team</th>
              <th className="px-3 py-3 text-center">P</th>
              <th className="px-3 py-3 text-center">W</th>
              <th className="px-3 py-3 text-center">D</th>
              <th className="px-3 py-3 text-center">L</th>
              <th className="px-3 py-3 text-center">GF</th>
              <th className="px-3 py-3 text-center">GA</th>
              <th className="px-3 py-3 text-center">GD</th>
              <th className="px-4 py-3 text-center">PTS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.team} className="border-t border-white/10">
                <td className="px-4 py-3 font-display text-lg font-bold text-brand-lime">
                  {index + 1}
                </td>
                <td className="px-4 py-3">
                  <TeamChip
                    abbr={row.team}
                    color={departments.get(row.team)?.primary_color}
                    name={departments.get(row.team)?.name}
                    logoUrl={departments.get(row.team)?.logo_url}
                  />
                </td>
                <td className="px-3 py-3 text-center">{row.played}</td>
                <td className="px-3 py-3 text-center">{row.won}</td>
                <td className="px-3 py-3 text-center">{row.drawn}</td>
                <td className="px-3 py-3 text-center">{row.lost}</td>
                <td className="px-3 py-3 text-center">{row.goalsFor}</td>
                <td className="px-3 py-3 text-center">{row.goalsAgainst}</td>
                <td className="px-3 py-3 text-center">{row.goalDifference}</td>
                <td className="px-4 py-3 text-center font-display text-lg font-bold">
                  {row.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function FootballMatchCard({
  match,
  departments,
  now,
  liveFixtures,
}: {
  match: FootballMatch;
  departments: Map<string, Department>;
  now: Date;
  liveFixtures: Fixture[];
}) {
  const sportSlug = match.gender === "female" ? "female-football" : "male-football";
  const isLive = isFootballMatchLive(match, now, liveFixtures);

  return (
    <Link
      to={`/sports/${sportSlug}/matches/${match.id}`}
      className={`card relative block w-full overflow-hidden p-4 text-left transition hover:-translate-y-0.5 hover:ring-brand-lime/50 ${
        isLive ? "live-glow ring-danger/40" : ""
      }`}
    >
      <span className="absolute -right-5 -top-8 text-8xl opacity-[0.06]" aria-hidden>
        ⚽
      </span>
      <div className="relative mb-3 flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.14em] text-white/50">
        <span>{match.stage}</span>
        <span className={`rounded-full px-2 py-1 ${isLive ? "bg-danger text-white" : "bg-white/10 text-brand-lime"}`}>
          {isLive ? "Live" : match.matchDay}
        </span>
      </div>
      <div className="relative">
        <MatchupTeams
          home={match.home}
          away={match.away}
          homeColor={departments.get(match.home)?.primary_color}
          awayColor={departments.get(match.away)?.primary_color}
          homeName={departments.get(match.home)?.name}
          awayName={departments.get(match.away)?.name}
          homeLogo={departments.get(match.home)?.logo_url}
          awayLogo={departments.get(match.away)?.logo_url}
          center={
            <span className="flex flex-col items-center gap-1.5">
              <span className={`rounded-full px-3 py-1 font-display text-xl font-bold ${isLive ? "bg-danger text-white" : "bg-white/10"}`}>
                vs
              </span>
              {isLive ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-danger px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-white">
                  <span className="h-1.5 w-1.5 animate-pulse-live rounded-full bg-white" aria-hidden />
                  Live now
                </span>
              ) : (
                <span className="font-display text-base font-bold uppercase leading-none text-brand-lime">
                  {match.scheduledTime ?? "Time TBA"}
                </span>
              )}
              <span className="max-w-28 text-[10px] font-bold uppercase leading-tight tracking-[0.12em] text-white/45">
                {match.venue ?? "Venue TBA"}
              </span>
            </span>
          }
          centerClassName=""
          layout="stacked"
        />
      </div>
    </Link>
  );
}

function MatchDetailPanel({
  match,
  departments,
  className = "sticky top-20",
}: {
  match: FootballMatch | null;
  departments: Map<string, Department>;
  className?: string;
}) {
  if (!match) {
    return (
      <div className="card grid min-h-72 place-items-center p-6 text-center">
        <div>
          <p className="font-display text-3xl font-bold">Select a football match</p>
          <p className="mt-2 text-sm text-white/62">
            Scoreline, goals, assists and highlights will show here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <aside className={`card overflow-hidden p-5 ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-lime">
            Match details
          </p>
          <p className="font-display text-2xl font-bold">{match.group} · {match.matchDay}</p>
        </div>
        <span className="text-4xl" aria-hidden>⚽</span>
      </div>

      <div className="rounded-3xl bg-white/8 p-4 ring-1 ring-white/10">
        <MatchupTeams
          home={match.home}
          away={match.away}
          homeColor={departments.get(match.home)?.primary_color}
          awayColor={departments.get(match.away)?.primary_color}
          homeName={departments.get(match.home)?.name}
          awayName={departments.get(match.away)?.name}
          homeLogo={departments.get(match.home)?.logo_url}
          awayLogo={departments.get(match.away)?.logo_url}
          center={<span className="font-display text-4xl font-bold text-brand-lime">-</span>}
          centerClassName=""
          layout="stacked"
        />
        <p className="mt-3 text-center text-xs font-bold uppercase tracking-[0.16em] text-white/45">
          {match.scheduledTime ?? "Time TBA"} / {match.venue ?? "Venue TBA"}
        </p>
      </div>

      <div className="mt-4 grid gap-3">
        <DetailBlock title="Goal scorers" body="No goals recorded yet." />
        <DetailBlock title="Assists" body="No assists recorded yet." />
        <DetailBlock title="Highlights" body="Highlights will be added after match media is available." />
      </div>
    </aside>
  );
}

function DetailBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-white/8 p-4 ring-1 ring-white/10">
      <p className="font-display text-xl font-bold">{title}</p>
      <p className="mt-1 text-sm text-white/62">{body}</p>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      {title && <h2 className="mb-2 font-display text-xl font-bold">{title}</h2>}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}

