import { describe, expect, it } from "vitest";
import { FALLBACK_SPORT_ICON, sportIcon } from "./sportIcons";

const SEEDED_SLUGS = [
  "male-football",
  "female-football",
  "basketball",
  "volleyball",
  "table-tennis",
  "athletics",
  "marathon",
  "swimming",
  "chess",
  "scrabble",
  "ludo",
  "efootball",
  "cod-mobile",
  "indoor-games",
];

describe("sportIcon", () => {
  it("returns a non-fallback glyph for every seeded sport", () => {
    for (const slug of SEEDED_SLUGS) {
      expect(sportIcon(slug)).not.toBe(FALLBACK_SPORT_ICON);
      expect(sportIcon(slug).length).toBeGreaterThan(0);
    }
  });

  it("falls back for unknown slugs", () => {
    expect(sportIcon("quidditch")).toBe(FALLBACK_SPORT_ICON);
  });

  it("uses the icon-name lookup when the slug is unknown", () => {
    expect(sportIcon("unknown-slug", "soccer")).toBe("⚽");
  });
});
