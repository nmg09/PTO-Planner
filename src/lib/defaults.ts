import { endOfYear, startOfYear } from "date-fns";
import type { AppState, YearPlan } from "../types/app";
import { formatDate } from "./date";

export const makeYearPlan = (year: number): YearPlan => ({
  year,
  settings: {
    vacationEntitlementDays: 27,
    carryoverCapDays: 11,
    defaultCountOnlyWorkdays: true,
    scheduleRanges: [
      {
        id: crypto.randomUUID(),
        startDate: formatDate(startOfYear(new Date(year, 0, 1))),
        endDate: formatDate(endOfYear(new Date(year, 0, 1))),
        workDays: [1, 2, 3, 4, 5]
      }
    ]
  },
  leaves: [],
  events: [],
  holidays: []
});

export const makeInitialState = (year = new Date().getFullYear()): AppState => ({
  activeYear: year,
  years: {
    [String(year)]: makeYearPlan(year)
  }
});
