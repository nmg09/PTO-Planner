export type LeaveType = "vacation" | "sick";
export type LeaveStatus = "planned" | "requested" | "approved" | "rejected";
export type EventCategory = "wedding" | "trip" | "family" | "work" | "other";

export type WorkScheduleRange = {
  id: string;
  startDate: string;
  endDate: string | null;
  workDays: number[];
};

export type LeaveBlock = {
  id: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  countOnlyWorkdays: boolean;
  startFraction: 1 | 0.5;
  endFraction: 1 | 0.5;
  status: LeaveStatus;
  linkedEventId?: string;
  note?: string;
};

export type KeyEvent = {
  id: string;
  title: string;
  category: EventCategory;
  startDate: string;
  endDate: string;
  location?: string;
  note?: string;
};

export type YearSettings = {
  vacationEntitlementDays: number;
  carryoverCapDays: number;
  defaultCountOnlyWorkdays: boolean;
  scheduleRanges: WorkScheduleRange[];
};

export type YearPlan = {
  year: number;
  settings: YearSettings;
  leaves: LeaveBlock[];
  events: KeyEvent[];
};

export type AppState = {
  activeYear: number;
  years: Record<string, YearPlan>;
};
