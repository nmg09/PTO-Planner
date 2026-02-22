import { eachDayOfInterval, getDay, isAfter, isBefore, isEqual } from "date-fns";
import { formatDate, parseDate } from "./date";
import type { WorkScheduleRange } from "../types/app";

export const dateInRange = (
  dateString: string,
  range: WorkScheduleRange
): boolean => {
  const date = parseDate(dateString);
  const start = parseDate(range.startDate);
  if (isBefore(date, start)) {
    return false;
  }

  if (!range.endDate) {
    return true;
  }

  const end = parseDate(range.endDate);
  return !isAfter(date, end);
};

export const getScheduleForDate = (
  dateString: string,
  ranges: WorkScheduleRange[]
): WorkScheduleRange | undefined =>
  ranges.find((range) => dateInRange(dateString, range));

export const isWorkdayForDate = (
  dateString: string,
  ranges: WorkScheduleRange[]
): boolean => {
  const schedule = getScheduleForDate(dateString, ranges);
  if (!schedule) {
    return false;
  }
  const weekday = getDay(parseDate(dateString));
  return schedule.workDays.includes(weekday);
};

const overlaps = (a: WorkScheduleRange, b: WorkScheduleRange): boolean => {
  const aStart = parseDate(a.startDate);
  const bStart = parseDate(b.startDate);
  const aEnd = a.endDate ? parseDate(a.endDate) : null;
  const bEnd = b.endDate ? parseDate(b.endDate) : null;

  const aEndsBeforeBStarts = aEnd && isBefore(aEnd, bStart);
  const bEndsBeforeAStarts = bEnd && isBefore(bEnd, aStart);

  if (aEndsBeforeBStarts || bEndsBeforeAStarts) {
    return false;
  }

  if (aEnd && isEqual(aEnd, bStart)) {
    return true;
  }
  if (bEnd && isEqual(bEnd, aStart)) {
    return true;
  }

  return true;
};

export const validateNoOverlap = (
  ranges: WorkScheduleRange[]
): { valid: boolean; message?: string } => {
  const sorted = [...ranges].sort((a, b) =>
    a.startDate.localeCompare(b.startDate)
  );

  for (let i = 0; i < sorted.length - 1; i += 1) {
    for (let j = i + 1; j < sorted.length; j += 1) {
      if (overlaps(sorted[i], sorted[j])) {
        return {
          valid: false,
          message: `Schedule ranges overlap: ${sorted[i].startDate} and ${sorted[j].startDate}`
        };
      }
    }
  }

  return { valid: true };
};

export const listDates = (startDate: string, endDate: string): string[] =>
  eachDayOfInterval({
    start: parseDate(startDate),
    end: parseDate(endDate)
  }).map((value) => formatDate(value));
