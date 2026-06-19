export const config = {
  appName: import.meta.env.VITE_APP_NAME ?? "BIOLYMPICS LIVE",
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1",
  wsBaseUrl: import.meta.env.VITE_WS_BASE_URL ?? "ws://localhost:8000/api/v1/ws",
  vapidPublicKey: import.meta.env.VITE_VAPID_PUBLIC_KEY ?? "",
  timezone: import.meta.env.VITE_DEFAULT_TIMEZONE ?? "Africa/Lagos",
};
