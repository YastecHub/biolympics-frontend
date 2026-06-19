/// <reference types="vitest/config" />
import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: ["assets/ullssa-logo-mark.png"],
      manifest: {
        name: "BIOLYMPICS LIVE",
        short_name: "Biolympics",
        description: "Life Sciences Dean's Games 2026 — live scores",
        theme_color: "#0b3d24",
        background_color: "#0b1411",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/assets/ullssa-logo-mark.png", sizes: "64x64", type: "image/png", purpose: "any" },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        // Cache schedule/sports/departments/results for offline viewing.
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/api/v1/"),
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  server: { port: 5173, host: true },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true,
    // Unit tests live in src/. Playwright specs in e2e/ run via `npm run test:e2e`.
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["e2e/**", "node_modules/**"],
  },
});
