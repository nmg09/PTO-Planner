import { format, isValid, parseISO } from "date-fns";

export const DATE_FORMAT = "yyyy-MM-dd";

export const parseDate = (value: string): Date => parseISO(value);

export const formatDate = (value: Date): string => format(value, DATE_FORMAT);

export const isValidDateString = (value: string): boolean => {
  const parsed = parseISO(value);
  return isValid(parsed) && format(parsed, DATE_FORMAT) === value;
};
