import { z } from "zod";
import { isValidDateString } from "./date";
import { isAfter } from "date-fns";
import { parseDate } from "./date";
import { validateNoOverlap } from "./schedule";

const dateString = z
  .string()
  .refine(isValidDateString, "Date must be YYYY-MM-DD");

const idSchema = z.string().min(1);

export const workScheduleRangeSchema = z.object({
  id: idSchema,
  startDate: dateString,
  endDate: dateString.nullable(),
  workDays: z.array(z.number().int().min(0).max(6)).min(1).max(7)
}).superRefine((value, ctx) => {
  if (value.endDate && isAfter(parseDate(value.startDate), parseDate(value.endDate))) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Schedule range start date must be on or before end date"
    });
  }

  if (new Set(value.workDays).size !== value.workDays.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Schedule workdays must not contain duplicates"
    });
  }
});

export const leaveSchema = z
  .object({
    id: idSchema,
    type: z.enum(["vacation", "sick"]),
    startDate: dateString,
    endDate: dateString,
    countOnlyWorkdays: z.boolean(),
    startFraction: z.union([z.literal(1), z.literal(0.5)]),
    endFraction: z.union([z.literal(1), z.literal(0.5)]),
    status: z.enum(["planned", "requested", "approved", "rejected"]),
    linkedEventId: z.string().optional(),
    note: z.string().optional()
  })
  .superRefine((value, ctx) => {
    if (isAfter(parseDate(value.startDate), parseDate(value.endDate))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Leave start date must be on or before end date"
      });
    }

    if (value.type === "sick" && value.status === "rejected") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Sick leave cannot be rejected"
      });
    }
  });

export const eventSchema = z.object({
  id: idSchema,
  title: z.string().min(1),
  category: z.enum(["wedding", "trip", "family", "work", "other"]),
  startDate: dateString,
  endDate: dateString,
  location: z.string().optional(),
  note: z.string().optional()
}).superRefine((value, ctx) => {
  if (isAfter(parseDate(value.startDate), parseDate(value.endDate))) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Event start date must be on or before end date"
    });
  }
});

export const holidaySchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  date: dateString,
  country: z.string().optional(),
  source: z.enum(["public", "custom"])
});

export const yearPlanSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  settings: z.object({
    vacationEntitlementDays: z.number().min(0).max(366),
    carryoverCapDays: z.number().min(0).max(366),
    defaultCountOnlyWorkdays: z.boolean(),
    scheduleRanges: z.array(workScheduleRangeSchema).min(1)
  }),
  leaves: z.array(leaveSchema),
  events: z.array(eventSchema),
  holidays: z.array(holidaySchema).default([])
}).superRefine((value, ctx) => {
  const scheduleValidation = validateNoOverlap(value.settings.scheduleRanges);
  if (!scheduleValidation.valid) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: scheduleValidation.message ?? "Schedule ranges overlap"
    });
  }
});

export const appStateSchema = z.object({
  activeYear: z.number().int().min(2000).max(2100),
  years: z.record(yearPlanSchema)
});

export type YearPlanInput = z.infer<typeof yearPlanSchema>;
