import { addMonths, eachDayOfInterval, endOfMonth, format, getDay, isSameDay, isWithinInterval, parseISO, startOfMonth, subMonths } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Modal } from "../components/ui/Modal";
import { EVENT_CATEGORY_ICONS } from "../lib/constants";
import { formatDate } from "../lib/date";
import { getScheduleForDate, isWorkdayForDate } from "../lib/schedule";
import { useAppState } from "../state/AppContext";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getWeekStartDay = (monthDays: Date[], scheduleRanges: ReturnType<typeof useAppState>["activePlan"]["settings"]["scheduleRanges"]) => {
  const patternCounts: Record<string, number> = {};

  monthDays.forEach((day) => {
    const schedule = getScheduleForDate(formatDate(day), scheduleRanges);
    if (!schedule) {
      return;
    }
    const normalized = [...new Set(schedule.workDays)].sort((a, b) => a - b);
    const key = normalized.join(",");
    patternCounts[key] = (patternCounts[key] ?? 0) + 1;
  });

  const dominantKey = Object.entries(patternCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  if (!dominantKey) {
    return 1;
  }

  const dominantDays = dominantKey.split(",").map(Number);
  return Math.min(...dominantDays);
};

export const PlannerPage = () => {
  const { activePlan } = useAppState();
  const [month, setMonth] = useState(new Date(activePlan.year, new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const weekStartsOn = getWeekStartDay(daysInMonth, activePlan.settings.scheduleRanges);

  const orderedWeekdays = useMemo(
    () => [...WEEKDAYS.slice(weekStartsOn), ...WEEKDAYS.slice(0, weekStartsOn)],
    [weekStartsOn]
  );

  const startPad = (getDay(monthStart) - weekStartsOn + 7) % 7;
  const baseDays: Array<Date | null> = [...Array.from({ length: startPad }, () => null), ...daysInMonth];
  const endPad = (7 - (baseDays.length % 7)) % 7;
  const calendarDays: Array<Date | null> = [...baseDays, ...Array.from({ length: endPad }, () => null)];

  const getDayInfo = (date: Date) => {
    const iso = formatDate(date);
    const dayLeaves = activePlan.leaves.filter((leave) =>
      isWithinInterval(date, {
        start: parseISO(leave.startDate),
        end: parseISO(leave.endDate)
      })
    );
    const dayEvents = activePlan.events.filter((event) =>
      isWithinInterval(date, {
        start: parseISO(event.startDate),
        end: parseISO(event.endDate)
      })
    );
    const holiday = activePlan.holidays.find((item) => item.date === iso);
    const isWorkday = isWorkdayForDate(iso, activePlan.settings.scheduleRanges, activePlan.holidays);
    return { dayLeaves, dayEvents, holiday, isWorkday };
  };

  const selectedInfo = useMemo(
    () => (selectedDate ? getDayInfo(selectedDate) : null),
    [selectedDate, activePlan]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2">
        <CalendarDays className="h-5 w-5 text-sky-600" />
        <h1 className="text-2xl font-bold tracking-tight">Planner</h1>
      </div>

      <Card className="overflow-hidden">
        <div className="mb-4 grid w-full grid-cols-[44px_1fr_44px] items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 p-1">
          <Button variant="secondary" className="!rounded-xl !px-2" onClick={() => setMonth(subMonths(month, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-center text-base font-semibold tracking-tight">{format(month, "MMMM yyyy")}</span>
          <Button variant="secondary" className="!rounded-xl !px-2" onClick={() => setMonth(addMonths(month, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-px">
          {orderedWeekdays.map((day) => (
            <div key={day} className="p-1 text-center text-xs font-medium text-slate-500 md:p-2">
              {day}
            </div>
          ))}

          {calendarDays.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const info = getDayInfo(day);
            const hasVacation = info.dayLeaves.some((leave) => leave.type === "vacation");
            const hasSick = info.dayLeaves.some((leave) => leave.type === "sick");
            const isToday = isSameDay(day, new Date());

            return (
              <button
                key={formatDate(day)}
                onClick={() => setSelectedDate(day)}
                className={`relative flex aspect-square flex-col items-center justify-start rounded-md border p-1 text-xs transition ${
                  !info.isWorkday && !info.holiday ? "border-slate-200 bg-slate-100" : "border-transparent"
                } ${hasVacation ? "bg-sky-100" : ""} ${hasSick ? "bg-orange-100" : ""} ${
                  info.holiday ? "border-holiday bg-holiday/20" : ""
                } ${isToday ? "ring-2 ring-sky-500 ring-offset-1" : ""} hover:bg-slate-100`}
              >
                <span className={`font-medium ${isToday ? "text-sky-600" : ""}`}>{format(day, "d")}</span>
                <div className="mt-auto flex gap-0.5">
                  {hasVacation && <div className="h-1.5 w-1.5 rounded-full bg-sky-500" />}
                  {hasSick && <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />}
                  {info.holiday && <div className="h-1.5 w-1.5 rounded-full bg-holiday" />}
                  {info.dayEvents.length > 0 && <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 text-xs text-slate-600">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-sky-500" />
          Vacation
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-orange-500" />
          Sick
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-holiday" />
          Holiday
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-slate-300" />
          Off-day
        </div>
      </div>

      <Modal
        open={Boolean(selectedDate)}
        onClose={() => setSelectedDate(null)}
        title={selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Day details"}
      >
        {selectedInfo && (
          <div className="space-y-3">
            {selectedInfo.holiday && <Badge tone="rose">Holiday: {selectedInfo.holiday.name}</Badge>}
            {!selectedInfo.isWorkday && !selectedInfo.holiday && <Badge tone="slate">Off-day</Badge>}

            {selectedInfo.dayLeaves.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">Leaves</p>
                {selectedInfo.dayLeaves.map((leave) => (
                  <div key={leave.id} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-center gap-2">
                      <Badge tone={leave.type === "vacation" ? "sky" : "amber"}>{leave.type}</Badge>
                      <span className="text-sm">{leave.startDate} to {leave.endDate}</span>
                    </div>
                    {leave.note && <p className="mt-1 text-xs text-slate-500">{leave.note}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No leaves on this day.</p>
            )}

            {selectedInfo.dayEvents.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Events</p>
                {selectedInfo.dayEvents.map((event) => (
                  <div key={event.id} className="flex items-center gap-2 rounded-lg border border-slate-200 p-3">
                    <span>{EVENT_CATEGORY_ICONS[event.category] ?? EVENT_CATEGORY_ICONS.other}</span>
                    <div>
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-slate-500">{event.location ?? "No location"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
