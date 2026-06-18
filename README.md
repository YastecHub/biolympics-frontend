# BIOLYMPICS LIVE — Frontend

Mobile-first PWA for the Life Sciences Dean's Games 2026. React + TypeScript
(strict) + Vite + Tailwind + TanStack Query, with a resilient WebSocket client
for live scores.

## Stack
- React 18, TypeScript (strict), Vite 5
- React Router, TanStack Query (server state), Zustand (small client state)
- Tailwind CSS with centralized brand tokens (CSS variables)
- React Hook Form + Zod (admin forms)
- vite-plugin-pwa (service worker, offline caching, installable)
- Vitest + Testing Library (unit) and Playwright (e2e)

## Develop

```bash
npm install
cp .env.example .env
npm run dev          # http://localhost:5173

npm run build        # type-check + production build
npm run test:run     # unit tests
npm run lint
```

## Architecture notes
- **Live updates:** `src/hooks/useLive.ts` opens one app-wide WebSocket
  (`src/lib/ws.ts`) with exponential backoff + heartbeat, patches the TanStack
  Query caches in place, and re-fetches via REST on reconnect. Live pages also
  poll every 20s as a fallback when WebSockets are blocked.
- **Versioned events:** stale events (lower `version` than cached state) are
  ignored so out-of-order frames never roll the score back.
- **Theming:** all colours come from CSS variables in `src/index.css` mapped to
  Tailwind tokens in `tailwind.config.js`. Light + dark themes included.
- **Accessibility:** skip link, focus-visible outlines, ARIA live regions for
  connection status, reduced-motion support, semantic tables.
- **Offline:** schedule/sports/departments/results are cached by the service
  worker (NetworkFirst); the connection chip shows when data may be stale.
- **No secrets:** only `VITE_*` public values are bundled; the VAPID *public*
  key is fetched from the API at runtime.

## Pages
Home · Live · Fixtures · Results · Sports (+ per-sport tabs) · Departments
(+ detail) · Standings · Medal Table · Announcements · Fixture detail · Admin
(login + Live Control Centre).
