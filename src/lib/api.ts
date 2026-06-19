import axios from "axios";
import { config } from "./config";
import type {
  Announcement,
  Department,
  Fixture,
  MedalRow,
  Sponsor,
  Sport,
  Standing,
  Tournament,
} from "@/types";

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
  startFixture: (id: string) =>
    http.post(`/admin/fixtures/${id}/start`).then((r) => r.data),
  scoreFixture: (id: string, body: { expected_version: number; home_delta?: number; away_delta?: number }) =>
    http.post(`/admin/fixtures/${id}/score`, body).then((r) => r.data),
  completeFixture: (id: string, expected_version: number) =>
    http.post(`/admin/fixtures/${id}/complete`, { expected_version }).then((r) => r.data),
};
