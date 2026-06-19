// Shared API types mirroring the backend Pydantic response models.

export type FixtureStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "WARMUP"
  | "LIVE"
  | "HALF_TIME"
  | "PERIOD_BREAK"
  | "PAUSED"
  | "DELAYED"
  | "POSTPONED"
  | "COMPLETED"
  | "CANCELLED"
  | "WALKOVER"
  | "UNDER_REVIEW";

export const LIVE_STATUSES: FixtureStatus[] = [
  "LIVE",
  "HALF_TIME",
  "PERIOD_BREAK",
  "PAUSED",
];

export interface Tournament {
  id: string;
  name: string;
  public_brand: string;
  slug: string;
  timezone: string;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  medal_points: Record<string, number>;
}

export interface Sport {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  gender_category: string;
  competition_format: string;
  scoring_type: string;
  requires_table: boolean;
  requires_bracket: boolean;
  supports_live: boolean;
  uses_timing: boolean;
  periods: number;
  display_order: number;
  is_active: boolean;
}

export interface Department {
  id: string;
  name: string;
  abbreviation: string;
  short_name: string | null;
  slug: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  description: string | null;
  contact_person: string | null;
  is_active: boolean;
}

export interface TeamRef {
  id: string;
  department_abbr: string | null;
  department_name: string | null;
  display_name: string | null;
  logo_url: string | null;
  primary_color: string | null;
}

export interface LiveState {
  home_score: number;
  away_score: number;
  period: string | null;
  current_period_number: number;
  clock_text: string | null;
  home_sets: number;
  away_sets: number;
  status_text: string | null;
  extra: Record<string, unknown>;
  version: number;
  last_updated_at: string | null;
}

export interface Fixture {
  id: string;
  sport_slug: string;
  sport_name: string;
  status: FixtureStatus;
  round_name: string | null;
  match_day: number | null;
  group_name: string | null;
  home: TeamRef | null;
  away: TeamRef | null;
  venue_name: string | null;
  venue_tbd: boolean;
  scheduled_start: string | null;
  scheduled_end: string | null;
  time_tbd: boolean;
  published: boolean;
  version: number;
  live: LiveState | null;
}

export interface StandingRow {
  team_id: string;
  department_abbr: string | null;
  department_name: string | null;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}

export interface Standing {
  sport_slug: string;
  group_name: string | null;
  tie_breakers: string[];
  rows: StandingRow[];
}

export interface MedalRow {
  department_id: string;
  department_abbr: string;
  department_name: string;
  position: number;
  gold: number;
  silver: number;
  bronze: number;
  participation_points: number;
  bonus_points: number;
  penalties: number;
  total_points: number;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  type: string;
  is_urgent: boolean;
  sport_id: string | null;
  department_id: string | null;
  fixture_id: string | null;
  published_at: string | null;
  expires_at: string | null;
}

export interface Sponsor {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  tier: string | null;
  display_order: number;
}

export interface LiveEvent {
  type: string;
  event_id?: string;
  fixture_id: string | null;
  sport: string | null;
  timestamp: string;
  version: number | null;
  payload: Record<string, unknown>;
}
