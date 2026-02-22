import { describe, expect, it } from "vitest";
import { calculateLeaveDayUnits, getVacationUsage } from "../src/lib/leave";
import type { LeaveBlock, WorkScheduleRange } from "../src/types/app";

const schedule: WorkScheduleRange[] = [
  {
    id: "default",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    workDays: [1, 2, 3, 4, 5]
  }
];

const leaveBase: LeaveBlock = {
  id: "x",
  type: "vacation",
  startDate: "2026-01-05",
  endDate: "2026-01-09",
  countOnlyWorkdays: true,
  startFraction: 1,
  endFraction: 1,
  status: "planned"
};

describe("leave day-units", () => {
  it("counts only workdays", () => {
    expect(calculateLeaveDayUnits(leaveBase, schedule)).toBe(5);
  });

  it("applies half-days on boundaries", () => {
    const half = { ...leaveBase, startFraction: 0.5 as const, endFraction: 0.5 as const };
    expect(calculateLeaveDayUnits(half, schedule)).toBe(4);
  });

  it("single included day uses min of start and end fractions", () => {
    const single = {
      ...leaveBase,
      startDate: "2026-01-06",
      endDate: "2026-01-06",
      startFraction: 1 as const,
      endFraction: 0.5 as const
    };
    expect(calculateLeaveDayUnits(single, schedule)).toBe(0.5);
  });

  it("excludes holidays when counting only workdays", () => {
    expect(
      calculateLeaveDayUnits(leaveBase, schedule, [
        {
          id: "h1",
          name: "Holiday",
          date: "2026-01-07",
          source: "custom"
        }
      ])
    ).toBe(4);
  });
});

describe("vacation totals", () => {
  it("excludes rejected from planned and approved usage", () => {
    const leaves: LeaveBlock[] = [
      { ...leaveBase, id: "planned", status: "planned" },
      { ...leaveBase, id: "approved", status: "approved" },
      { ...leaveBase, id: "requested", status: "requested" },
      { ...leaveBase, id: "rejected", status: "rejected" }
    ];

    const usage = getVacationUsage(leaves, schedule);
    expect(usage.plannedUsed).toBe(15);
    expect(usage.approvedUsed).toBe(5);
  });
});
