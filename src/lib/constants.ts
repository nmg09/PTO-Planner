export const LEAVE_STATUS_OPTIONS = [
  "planned",
  "requested",
  "approved",
  "rejected"
] as const;

export const LEAVE_TYPE_OPTIONS = ["vacation", "sick"] as const;

export const EVENT_CATEGORY_OPTIONS = [
  "wedding",
  "trip",
  "family",
  "work",
  "other"
] as const;

export const WEEKDAY_OPTIONS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" }
] as const;
