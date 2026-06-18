import { expect, test } from "@playwright/test";

// These run against a seeded, running stack (docker compose up + make seed).
test.describe("public experience", () => {
  test("homepage loads with branding", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "BIOLYMPICS LIVE" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Fixtures" })).toBeVisible();
  });

  test("fixtures page lists upcoming matches and filters", async ({ page }) => {
    await page.goto("/fixtures");
    await expect(page.getByRole("heading", { name: "Fixtures" })).toBeVisible();
    await page.getByLabel("Filter by sport").selectOption({ label: "Male Football" });
    await expect(page.getByLabel("Search fixtures")).toBeVisible();
  });

  test("results page renders", async ({ page }) => {
    await page.goto("/results");
    await expect(page.getByRole("heading", { name: "Results" })).toBeVisible();
  });

  test("standings page renders group tables", async ({ page }) => {
    await page.goto("/standings");
    await expect(page.getByRole("heading", { name: "Standings" })).toBeVisible();
  });
});
