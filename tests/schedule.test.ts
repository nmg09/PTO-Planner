import { describe, expect, it } from "vitest";
import { getScheduleForDate, isWorkdayForDate } from "../src/lib/schedule";
import type { WorkScheduleRange } from "../src/types/app";

const ranges: WorkScheduleRange[] = [
  {
    id: "a",
    startDate: "2026-01-01",
    endDate: "2026-06-30",
    workDays: [1, 2, 3, 4, 5]
  },
  {
    id: "b",
    startDate: "2026-07-01",
    endDate: "2026-12-31",
    workDays: [0, 1, 2, 3, 4]
  }
];

describe("schedule lookup", () => {
  it("returns active schedule for a date", () => {
    const schedule = getScheduleForDate("2026-08-03", ranges);
    expect(schedule?.id).toBe("b");
  });

  it("derives workday by active range", () => {
    expect(isWorkdayForDate("2026-03-07", ranges)).toBe(false);
    expect(isWorkdayForDate("2026-08-02", ranges)).toBe(true);
  });
});
