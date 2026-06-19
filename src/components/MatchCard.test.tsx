import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MatchCard } from "./MatchCard";
import type { Fixture } from "@/types";

function makeFixture(overrides: Partial<Fixture> = {}): Fixture {
  return {
    id: "fx1",
    sport_slug: "male-football",
    sport_name: "Male Football",
    status: "LIVE",
    round_name: "Group A",
    match_day: 1,
    group_name: "Group A",
    home: {
      id: "t1",
      department_abbr: "BCH",
      department_name: "Biochemistry",
      display_name: "Biochem",
      logo_url: null,
      primary_color: "#00838f",
    },
    away: {
      id: "t2",
      department_abbr: "BTN",
      department_name: "Botany",
      display_name: "Botany",
      logo_url: null,
      primary_color: "#2e7d32",
    },
    venue_name: "Main Field",
    venue_tbd: false,
    scheduled_start: "2026-06-20T10:00:00Z",
    scheduled_end: null,
    time_tbd: false,
    published: true,
    version: 3,
    live: {
      home_score: 2,
      away_score: 1,
      period: "SECOND_HALF",
      current_period_number: 2,
      clock_text: "73:00",
      home_sets: 0,
      away_sets: 0,
      status_text: null,
      extra: {},
      version: 3,
      last_updated_at: "2026-06-20T11:13:00Z",
    },
    ...overrides,
  };
}

function renderCard(fx: Fixture) {
  return render(
    <MemoryRouter>
      <MatchCard fx={fx} />
    </MemoryRouter>,
  );
}

describe("MatchCard", () => {
  it("shows a LIVE badge and the current score for a live fixture", () => {
    renderCard(makeFixture());
    expect(screen.getByText("LIVE")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    // The abbreviation appears in both the logo chip and the label.
    expect(screen.getAllByText("BCH").length).toBeGreaterThanOrEqual(1);
  });

  it("marks participants as TBD when teams are not set", () => {
    renderCard(makeFixture({ home: null, away: null, round_name: "Semi-Final" }));
    expect(screen.getByText(/participants TBD/i)).toBeInTheDocument();
  });

  it("shows venue TBD when no venue is assigned", () => {
    renderCard(makeFixture({ status: "SCHEDULED", live: null, venue_tbd: true, venue_name: null }));
    expect(screen.getByText("Venue TBD")).toBeInTheDocument();
  });
});
