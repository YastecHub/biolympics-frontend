import { describe, expect, it } from "vitest";
import { dayKey, formatTime, timeAgo } from "./time";

describe("time helpers (Africa/Lagos)", () => {
  it("formats a UTC time into WAT (UTC+1)", () => {
    // 10:00 UTC -> 11:00 in Lagos
    expect(formatTime("2026-06-20T10:00:00Z")).toBe("11:00");
  });

  it("returns TBD for null timestamps", () => {
    expect(formatTime(null)).toBe("TBD");
    expect(dayKey(null)).toBe("TBD");
  });

  it("computes a day key in Lagos time", () => {
    expect(dayKey("2026-06-20T23:30:00Z")).toBe("2026-06-21"); // 00:30 next day in Lagos
  });

  it("describes recent times", () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(timeAgo(fiveMinAgo)).toMatch(/m ago/);
  });
});
