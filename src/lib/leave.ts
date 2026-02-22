import { isAfter } from "date-fns";
import type { LeaveBlock, LeaveStatus, WorkScheduleRange } from "../types/app";
import { listDates, isWorkdayForDate } from "./schedule";
import { parseDate } from "./date";

const VACATION_COUNTABLE_STATUSES: LeaveStatus[] = [
  "planned",
  "requested",
  "approved"
];

export const getIncludedDates = (
  leave: LeaveBlock,
  ranges: WorkScheduleRange[]
): string[] => {
  const rawDates = listDates(leave.startDate, leave.endDate);
  if (!leave.countOnlyWorkdays) {
    return rawDates;
  }

  return rawDates.filter((value) => isWorkdayForDate(value, ranges));
};

export const calculateLeaveDayUnits = (
  leave: LeaveBlock,
  ranges: WorkScheduleRange[]
): number => {
  if (isAfter(parseDate(leave.startDate), parseDate(leave.endDate))) {
    return 0;
  }

  const includedDates = getIncludedDates(leave, ranges);
  if (includedDates.length === 0) {
    return 0;
  }

  if (includedDates.length === 1) {
    return Math.min(leave.startFraction, leave.endFraction);
  }

  return includedDates.reduce((sum, _date, index) => {
    if (index === 0) {
      return sum + leave.startFraction;
    }
    if (index === includedDates.length - 1) {
      return sum + leave.endFraction;
    }
    return sum + 1;
  }, 0);
};

export const getVacationUsage = (
  leaves: LeaveBlock[],
  ranges: WorkScheduleRange[]
): { plannedUsed: number; approvedUsed: number } => {
  const vacationLeaves = leaves.filter((leave) => leave.type === "vacation");

  const plannedUsed = vacationLeaves
    .filter((leave) => VACATION_COUNTABLE_STATUSES.includes(leave.status))
    .reduce((sum, leave) => sum + calculateLeaveDayUnits(leave, ranges), 0);

  const approvedUsed = vacationLeaves
    .filter((leave) => leave.status === "approved")
    .reduce((sum, leave) => sum + calculateLeaveDayUnits(leave, ranges), 0);

  return { plannedUsed, approvedUsed };
};

export const getSickTotals = (
  leaves: LeaveBlock[],
  ranges: WorkScheduleRange[]
): { yearly: number; byMonth: Record<string, number> } => {
  const sickLeaves = leaves.filter((leave) => leave.type === "sick");
  const byMonth: Record<string, number> = {};

  let yearly = 0;

  sickLeaves.forEach((leave) => {
    const units = calculateLeaveDayUnits(leave, ranges);
    yearly += units;
    const monthKey = leave.startDate.slice(0, 7);
    byMonth[monthKey] = (byMonth[monthKey] ?? 0) + units;
  });

  return { yearly, byMonth };
};
