import { describe, expect, it } from "vitest";
import { eventSchema, leaveSchema, yearPlanSchema } from "../src/lib/schema";

describe("schema validation guards", () => {
  it("rejects leave with startDate after endDate", () => {
    const result = leaveSchema.safeParse({
      id: "leave-1",
      type: "vacation",
      startDate: "2026-02-10",
      endDate: "2026-02-09",
      countOnlyWorkdays: true,
      startFraction: 1,
      endFraction: 1,
      status: "planned"
    });

    expect(result.success).toBe(false);
  });

  it("rejects event with startDate after endDate", () => {
    const result = eventSchema.safeParse({
      id: "event-1",
      title: "Trip",
      category: "trip",
      startDate: "2026-06-15",
      endDate: "2026-06-01",
      location: "Rome",
      note: ""
    });

    expect(result.success).toBe(false);
  });

  it("rejects year plan with overlapping schedule ranges", () => {
    const result = yearPlanSchema.safeParse({
      year: 2026,
      settings: {
        vacationEntitlementDays: 25,
        carryoverCapDays: 10,
        defaultCountOnlyWorkdays: true,
        scheduleRanges: [
          {
            id: "a",
            startDate: "2026-01-01",
            endDate: "2026-06-30",
            workDays: [1, 2, 3, 4, 5]
          },
          {
            id: "b",
            startDate: "2026-06-15",
            endDate: "2026-12-31",
            workDays: [1, 2, 3, 4, 5]
          }
        ]
      },
      leaves: [],
      events: []
    });

    expect(result.success).toBe(false);
  });

  it("accepts year plan with non-overlapping schedule ranges", () => {
    const result = yearPlanSchema.safeParse({
      year: 2026,
      settings: {
        vacationEntitlementDays: 25,
        carryoverCapDays: 10,
        defaultCountOnlyWorkdays: true,
        scheduleRanges: [
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
            workDays: [1, 2, 3, 4, 5]
          }
        ]
      },
      leaves: [],
      events: []
    });

    expect(result.success).toBe(true);
  });
});
