import axios from "axios";
import { config } from "./config";
import type {
  Announcement,
  Department,
  Fixture,
  MatchEvent,
  MedalRow,
  Sponsor,
  Sport,
  Standing,
  StatusOut,
  Tournament,
} from "@/types";

export type ScoreFixtureBody = {
  expected_version: number;
  home_score?: number;
  away_score?: number;
  home_delta?: number;
  away_delta?: number;
  period?: string;
  clock_text?: string;
  home_sets?: number;
  away_sets?: number;
  extra?: Record<string, unknown>;
  idempotency_key?: string;
};

export type AnnouncementCreateBody = {
  title: string;
  body: string;
  type?: string;
  is_urgent?: boolean;
  sport_id?: string | null;
  department_id?: string | null;
  fixture_id?: string | null;
  publish?: boolean;
  expires_at?: string | null;
};

export const http = axios.create({
  baseURL: config.apiBaseUrl,
  withCredentials: true,
  timeout: 12000,
});

// Attach the access token (kept in memory by the auth store) when present.
let accessToken: string | null = null;
export function setAccessToken(token: string | null) {
  accessToken = token;
}
http.interceptors.request.use((cfg) => {
  if (accessToken) cfg.headers.Authorization = `Bearer ${accessToken}`;
  return cfg;
});

export const api = {
  currentTournament: () =>
    http.get<Tournament>("/tournaments/current").then((r) => r.data),
  sports: () => http.get<Sport[]>("/sports").then((r) => r.data),
  sport: (slug: string) => http.get<Sport>(`/sports/${slug}`).then((r) => r.data),
  departments: () => http.get<Department[]>("/departments").then((r) => r.data),
  department: (slug: string) =>
    http.get<Department>(`/departments/${slug}`).then((r) => r.data),
  fixtures: (params?: { sport?: string; status?: string }) =>
    http.get<Fixture[]>("/fixtures", { params }).then((r) => r.data),
  liveFixtures: () => http.get<Fixture[]>("/fixtures/live").then((r) => r.data),
  upcomingFixtures: (limit = 20) =>
    http.get<Fixture[]>("/fixtures/upcoming", { params: { limit } }).then((r) => r.data),
  fixture: (id: string) => http.get<Fixture>(`/fixtures/${id}`).then((r) => r.data),
  fixtureEvents: (id: string) =>
    http
      .get<
        {
          id: string;
          type: string;
          team_id: string | null;
          minute: number | null;
          period: string | null;
          detail: string | null;
          created_at: string;
        }[]
      >(`/fixtures/${id}/events`)
      .then((r) => r.data),
  results: (sport?: string) =>
    http.get<Fixture[]>("/results", { params: { sport } }).then((r) => r.data),
  schedule: () => http.get<Fixture[]>("/schedule").then((r) => r.data),
  standings: (sport?: string) =>
    http
      .get<Standing[]>(sport ? `/standings/${sport}` : "/standings")
      .then((r) => r.data),
  medalTable: () => http.get<MedalRow[]>("/medal-table").then((r) => r.data),
  announcements: () => http.get<Announcement[]>("/announcements").then((r) => r.data),
  sponsors: () => http.get<Sponsor[]>("/sponsors").then((r) => r.data),

  // Push
  pushPublicKey: () =>
    http.get<{ public_key: string }>("/push/public-key").then((r) => r.data),
  subscribePush: (body: unknown) =>
    http.post("/push/subscriptions", body).then((r) => r.data),

  // Auth
  login: (email: string, password: string) =>
    http
      .post<{ access_token: string; expires_in: number }>("/auth/login", {
        email,
        password,
      })
      .then((r) => r.data),
  me: () => http.get<{ id: string; email: string; roles: string[] }>("/auth/me").then((r) => r.data),
  logout: () => http.post("/auth/logout"),

  // Admin / score-official actions
  adminFixtures: (params?: { sport?: string; status?: string; include_drafts?: boolean }) =>
    http.get<Fixture[]>("/admin/fixtures", { params }).then((r) => r.data),
  adminAnnouncements: () =>
    http.get<Announcement[]>("/admin/announcements").then((r) => r.data),
  updateFixture: (
    id: string,
    body: {
      scheduled_start?: string | null;
      scheduled_end?: string | null;
      round_name?: string | null;
      match_day?: number | null;
      label?: string | null;
      published?: boolean;
    },
  ) => http.patch<Fixture>(`/admin/fixtures/${id}`, body).then((r) => r.data),
  startFixture: (id: string) =>
    http.post<StatusOut>(`/admin/fixtures/${id}/start`).then((r) => r.data),
  scoreFixture: (id: string, body: ScoreFixtureBody) =>
    http.post<StatusOut>(`/admin/fixtures/${id}/score`, body).then((r) => r.data),
  setFixturePeriod: (
    id: string,
    body: { expected_version: number; period: string; current_period_number?: number; clock_text?: string },
  ) => http.post<StatusOut>(`/admin/fixtures/${id}/period`, body).then((r) => r.data),
  addFixtureEvent: (
    id: string,
    body: { type: string; team_id?: string | null; minute?: number | null; period?: string | null; detail?: string | null },
  ) => http.post<MatchEvent>(`/admin/fixtures/${id}/events`, body).then((r) => r.data),
  pauseFixture: (id: string) =>
    http.post<StatusOut>(`/admin/fixtures/${id}/pause`).then((r) => r.data),
  resumeFixture: (id: string) =>
    http.post<StatusOut>(`/admin/fixtures/${id}/resume`).then((r) => r.data),
  completeFixture: (id: string, expected_version: number) =>
    http.post<StatusOut>(`/admin/fixtures/${id}/complete`, { expected_version }).then((r) => r.data),
  reopenFixture: (id: string, reason: string) =>
    http.post<StatusOut>(`/admin/fixtures/${id}/reopen`, { reason }).then((r) => r.data),
  correctFixture: (id: string, body: { home_score?: number; away_score?: number; reason: string }) =>
    http.post<StatusOut>(`/admin/fixtures/${id}/correct`, body).then((r) => r.data),
  postponeFixture: (id: string, reason: string) =>
    http.post<StatusOut>(`/admin/fixtures/${id}/postpone`, { reason }).then((r) => r.data),
  cancelFixture: (id: string, reason: string) =>
    http.post<StatusOut>(`/admin/fixtures/${id}/cancel`, { reason }).then((r) => r.data),
  rescheduleFixture: (
    id: string,
    body: { scheduled_start?: string | null; scheduled_end?: string | null; reason?: string | null },
  ) => http.post<Fixture>(`/admin/fixtures/${id}/reschedule`, body).then((r) => r.data),
  createAnnouncement: (body: AnnouncementCreateBody) =>
    http.post<Announcement>("/admin/announcements", body).then((r) => r.data),
};
