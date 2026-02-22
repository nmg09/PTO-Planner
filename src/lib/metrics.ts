import {
  addDays,
  isAfter,
  isBefore,
  isEqual,
  parseISO,
  startOfDay
} from "date-fns";
import type { KeyEvent, LeaveBlock, YearPlan } from "../types/app";
import { getCarryoverMetrics } from "./carryover";
import { getSickTotals, getVacationUsage } from "./leave";

export type DashboardMetrics = {
  plannedUsed: number;
  approvedUsed: number;
  remainingPlanned: number;
  remainingApproved: number;
  carryEstimate: number;
  forfeited: number;
  daysToTakeToAvoidForfeit: number;
  pendingApprovals: LeaveBlock[];
  upcoming: Array<{ kind: "leave" | "event"; date: string; title: string; id: string }>;
  sickYearly: number;
};

const dateWithin = (date: string, start: Date, end: Date): boolean => {
  const parsed = parseISO(date);
  return (
    (isAfter(parsed, start) || isEqual(parsed, start)) &&
    (isBefore(parsed, end) || isEqual(parsed, end))
  );
};

const leaveTitle = (leave: LeaveBlock): string =>
  `${leave.type === "vacation" ? "Vacation" : "Sick"} (${leave.status})`;

const eventTitle = (event: KeyEvent): string => event.title;

export const buildDashboardMetrics = (plan: YearPlan): DashboardMetrics => {
  const { approvedUsed, plannedUsed } = getVacationUsage(
    plan.leaves,
    plan.settings.scheduleRanges
  );

  const remainingPlanned = plan.settings.vacationEntitlementDays - plannedUsed;
  const remainingApproved = plan.settings.vacationEntitlementDays - approvedUsed;

  const carryover = getCarryoverMetrics(
    remainingApproved,
    plan.settings.carryoverCapDays
  );

  const today = startOfDay(new Date());
  const end = addDays(today, 60);

  const upcomingLeaves = plan.leaves
    .filter((leave) => dateWithin(leave.startDate, today, end))
    .map((leave) => ({
      kind: "leave" as const,
      date: leave.startDate,
      title: leaveTitle(leave),
      id: leave.id
    }));

  const upcomingEvents = plan.events
    .filter((event) => dateWithin(event.startDate, today, end))
    .map((event) => ({
      kind: "event" as const,
      date: event.startDate,
      title: eventTitle(event),
      id: event.id
    }));

  const pendingApprovals = plan.leaves.filter(
    (leave) => leave.type === "vacation" && leave.status === "requested"
  );

  const sick = getSickTotals(plan.leaves, plan.settings.scheduleRanges);

  return {
    plannedUsed,
    approvedUsed,
    remainingPlanned,
    remainingApproved,
    carryEstimate: carryover.carryEstimate,
    forfeited: carryover.forfeited,
    daysToTakeToAvoidForfeit: carryover.daysToTakeToAvoidForfeit,
    pendingApprovals,
    upcoming: [...upcomingLeaves, ...upcomingEvents].sort((a, b) =>
      a.date.localeCompare(b.date)
    ),
    sickYearly: sick.yearly
  };
};
