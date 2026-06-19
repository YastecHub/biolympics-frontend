import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setAccessToken } from "@/lib/api";

// ---- Follows (departments + sports) ----
interface FollowState {
  departments: string[];
  sports: string[];
  fixtures: string[];
  toggleDepartment: (slug: string) => void;
  toggleSport: (slug: string) => void;
  toggleFixture: (id: string) => void;
  isFollowing: (kind: "departments" | "sports" | "fixtures", key: string) => boolean;
}

const toggle = (arr: string[], key: string) =>
  arr.includes(key) ? arr.filter((k) => k !== key) : [...arr, key];

export const useFollowStore = create<FollowState>()(
  persist(
    (set, get) => ({
      departments: [],
      sports: [],
      fixtures: [],
      toggleDepartment: (slug) => set((s) => ({ departments: toggle(s.departments, slug) })),
      toggleSport: (slug) => set((s) => ({ sports: toggle(s.sports, slug) })),
      toggleFixture: (id) => set((s) => ({ fixtures: toggle(s.fixtures, id) })),
      isFollowing: (kind, key) => get()[kind].includes(key),
    }),
    { name: "biolympics-follows" },
  ),
);

// ---- Theme ----
interface ThemeState {
  theme: "light" | "dark";
  toggle: () => void;
  apply: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      toggle: () => {
        const next = get().theme === "dark" ? "light" : "dark";
        set({ theme: next });
        document.documentElement.classList.toggle("dark", next === "dark");
      },
      apply: () =>
        document.documentElement.classList.toggle("dark", get().theme === "dark"),
    }),
    { name: "biolympics-theme" },
  ),
);

// ---- Auth (access token kept in memory; refresh lives in an HttpOnly cookie) ----
interface AuthState {
  token: string | null;
  roles: string[];
  email: string | null;
  setAuth: (token: string, roles: string[], email: string) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  roles: [],
  email: null,
  setAuth: (token, roles, email) => {
    setAccessToken(token);
    set({ token, roles, email });
  },
  clear: () => {
    setAccessToken(null);
    set({ token: null, roles: [], email: null });
  },
}));
