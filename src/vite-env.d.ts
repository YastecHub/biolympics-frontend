/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_WS_BASE_URL?: string;
  readonly VITE_VAPID_PUBLIC_KEY?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_DEFAULT_TIMEZONE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
