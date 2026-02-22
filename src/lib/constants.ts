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

export const COUNTRY_OPTIONS = [
  { code: "US", name: "United States" },
  { code: "UK", name: "United Kingdom" },
  { code: "AE", name: "UAE" },
  { code: "IL", name: "Israel" },
  { code: "IN", name: "India" },
  { code: "AU", name: "Australia" },
  { code: "CA", name: "Canada" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" }
] as const;

export const EVENT_CATEGORY_ICONS: Record<string, string> = {
  wedding: "💍",
  trip: "✈️",
  family: "👨‍👩‍👧‍👦",
  work: "💼",
  other: "📌"
};

export const PUBLIC_HOLIDAYS: Record<string, { name: string; date: string }[]> = {
  US: [
    { name: "New Year's Day", date: "-01-01" },
    { name: "Martin Luther King Jr. Day", date: "-01-20" },
    { name: "Presidents' Day", date: "-02-17" },
    { name: "Memorial Day", date: "-05-26" },
    { name: "Independence Day", date: "-07-04" },
    { name: "Labor Day", date: "-09-01" },
    { name: "Thanksgiving", date: "-11-27" },
    { name: "Christmas Day", date: "-12-25" }
  ],
  UK: [
    { name: "New Year's Day", date: "-01-01" },
    { name: "Good Friday", date: "-04-18" },
    { name: "Easter Monday", date: "-04-21" },
    { name: "Early May Bank Holiday", date: "-05-05" },
    { name: "Spring Bank Holiday", date: "-05-26" },
    { name: "Summer Bank Holiday", date: "-08-25" },
    { name: "Christmas Day", date: "-12-25" },
    { name: "Boxing Day", date: "-12-26" }
  ],
  DE: [
    { name: "New Year's Day", date: "-01-01" },
    { name: "Good Friday", date: "-04-18" },
    { name: "Easter Monday", date: "-04-21" },
    { name: "Labour Day", date: "-05-01" },
    { name: "Ascension Day", date: "-05-29" },
    { name: "Whit Monday", date: "-06-09" },
    { name: "German Unity Day", date: "-10-03" },
    { name: "Christmas Day", date: "-12-25" },
    { name: "St Stephen's Day", date: "-12-26" }
  ],
  FR: [
    { name: "New Year's Day", date: "-01-01" },
    { name: "Easter Monday", date: "-04-21" },
    { name: "Labour Day", date: "-05-01" },
    { name: "Victory in Europe Day", date: "-05-08" },
    { name: "Ascension Day", date: "-05-29" },
    { name: "Bastille Day", date: "-07-14" },
    { name: "Assumption of Mary", date: "-08-15" },
    { name: "All Saints' Day", date: "-11-01" },
    { name: "Armistice Day", date: "-11-11" },
    { name: "Christmas Day", date: "-12-25" }
  ],
  IN: [
    { name: "Republic Day", date: "-01-26" },
    { name: "Independence Day", date: "-08-15" },
    { name: "Gandhi Jayanti", date: "-10-02" }
  ],
  AU: [
    { name: "New Year's Day", date: "-01-01" },
    { name: "Australia Day", date: "-01-26" },
    { name: "Good Friday", date: "-04-18" },
    { name: "Easter Monday", date: "-04-21" },
    { name: "Anzac Day", date: "-04-25" },
    { name: "Christmas Day", date: "-12-25" },
    { name: "Boxing Day", date: "-12-26" }
  ],
  CA: [
    { name: "New Year's Day", date: "-01-01" },
    { name: "Good Friday", date: "-04-18" },
    { name: "Canada Day", date: "-07-01" },
    { name: "Labour Day", date: "-09-01" },
    { name: "Thanksgiving", date: "-10-13" },
    { name: "Christmas Day", date: "-12-25" }
  ],
  AE: [
    { name: "New Year's Day", date: "-01-01" },
    { name: "Commemoration Day", date: "-11-30" },
    { name: "National Day", date: "-12-02" },
    { name: "National Day Holiday", date: "-12-03" }
  ],
  IL: [
    { name: "Independence Day", date: "-05-01" },
    { name: "Yom Kippur", date: "-10-02" }
  ]
};
