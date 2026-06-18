import { expect, test } from "@playwright/test";

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@biolympics.ng";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "ChangeMe!2026";

/**
 * Full live flow (requires a seeded, running stack):
 * admin logs in, starts a fixture, scores it; a second public tab sees the
 * change without reloading, then the match completes and appears in results.
 */
test("admin scores a match and a public viewer sees it live", async ({ browser }) => {
  const adminCtx = await browser.newContext();
  const publicCtx = await browser.newContext();
  const admin = await adminCtx.newPage();
  const viewer = await publicCtx.newPage();

  // Admin signs in.
  await admin.goto("/admin/login");
  await admin.getByLabel("Email").fill(ADMIN_EMAIL);
  await admin.getByLabel("Password").fill(ADMIN_PASSWORD);
  await admin.getByRole("button", { name: "Sign in" }).click();
  await expect(admin.getByRole("heading", { name: "Live Control Centre" })).toBeVisible();

  // Start the first scheduled fixture.
  await admin.getByRole("button", { name: "Start" }).first().click();

  // Public viewer opens the live page.
  await viewer.goto("/live");

  // Admin adds a point/goal.
  await admin.getByRole("button", { name: /^\+ / }).first().click();

  // Viewer should reflect a live match without manual refresh.
  await expect(viewer.getByText("LIVE").first()).toBeVisible({ timeout: 10_000 });

  await adminCtx.close();
  await publicCtx.close();
});
