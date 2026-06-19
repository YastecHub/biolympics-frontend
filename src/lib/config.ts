const isDev = import.meta.env.DEV;

const defaultApiBaseUrl = isDev
  ? "http://localhost:8000/api/v1"
  : "https://biolympics-backend.onrender.com/api/v1";

const defaultWsBaseUrl = isDev
  ? "ws://localhost:8000/api/v1/ws"
  : "wss://biolympics-backend.onrender.com/api/v1/ws";

function normalizeApiBaseUrl(url: string) {
  const clean = url.trim().replace(/\/+$/, "");
  return clean.endsWith("/api/v1") ? clean : `${clean}/api/v1`;
}

function normalizeWsBaseUrl(url: string) {
  const clean = url.trim().replace(/\/+$/, "");
  if (clean.endsWith("/api/v1/ws")) return clean;
  if (clean.endsWith("/api/v1")) return `${clean}/ws`;
  return `${clean}/api/v1/ws`;
}

export const config = {
  appName: import.meta.env.VITE_APP_NAME ?? "BIOLYMPICS LIVE",
  apiBaseUrl: normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL ?? defaultApiBaseUrl),
  wsBaseUrl: normalizeWsBaseUrl(import.meta.env.VITE_WS_BASE_URL ?? defaultWsBaseUrl),
  vapidPublicKey: import.meta.env.VITE_VAPID_PUBLIC_KEY ?? "",
  timezone: import.meta.env.VITE_DEFAULT_TIMEZONE ?? "Africa/Lagos",
};
