import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subMonths
} from "date-fns";
import { useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Modal } from "../components/ui/Modal";
import { formatDate } from "../lib/date";
import { getScheduleForDate, isWorkdayForDate } from "../lib/schedule";
import { useAppState } from "../state/AppContext";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getDominantWorkDays = (
  monthDays: Date[],
  scheduleRanges: ReturnType<typeof useAppState>["activePlan"]["settings"]["scheduleRanges"]
): number[] => {
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
    return [1, 2, 3, 4, 5];
  }

  return dominantKey.split(",").map((value) => Number(value));
};

const chunkWeeks = (days: Date[]): Date[][] => {
  const weeks: Date[][] = [];
  for (let index = 0; index < days.length; index += 7) {
    weeks.push(days.slice(index, index + 7));
  }
  return weeks;
};

export const PlannerPage = () => {
  const { activePlan } = useAppState();
  const [month, setMonth] = useState(new Date(activePlan.year, new Date().getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [workdaysOnly, setWorkdaysOnly] = useState(false);

  const monthDays = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfMonth(month),
        end: endOfMonth(month)
      }),
    [month]
  );

  const dominantWorkDays = useMemo(
    () => getDominantWorkDays(monthDays, activePlan.settings.scheduleRanges),
    [activePlan.settings.scheduleRanges, monthDays]
  );

  const weekStartsOn = dominantWorkDays[0] === 0 ? 0 : 1;
  const orderedWeekDays =
    weekStartsOn === 0 ? [0, 1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5, 6, 0];

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn });
    return eachDayOfInterval({ start, end });
  }, [month, weekStartsOn]);

  const weeks = useMemo(() => chunkWeeks(calendarDays), [calendarDays]);

  const dayItems = (date: Date) => {
    const iso = formatDate(date);
    const leaves = activePlan.leaves.filter(
      (leave) => leave.startDate <= iso && leave.endDate >= iso
    );
    const events = activePlan.events.filter(
      (event) => event.startDate <= iso && event.endDate >= iso
    );
    return { leaves, events };
  };

  const renderDayCell = (date: Date, compact = false) => {
    const iso = formatDate(date);
    const inMonth = date.getMonth() === month.getMonth();
    const items = dayItems(date);
    const isWorkday = isWorkdayForDate(iso, activePlan.settings.scheduleRanges);
    const vacationCount = items.leaves.filter((leave) => leave.type === "vacation").length;
    const sickCount = items.leaves.filter((leave) => leave.type === "sick").length;
    const eventCount = items.events.length;
    const hasItems = vacationCount + sickCount + eventCount > 0;

    return (
      <button
        key={iso}
        onClick={() => setSelectedDay(date)}
        className={`rounded-xl border p-2 text-left transition ${
          compact ? "min-h-24" : "min-h-20"
        } ${inMonth ? "bg-white" : "bg-slate-50 text-slate-400"} ${
          isWorkday ? "border-slate-200" : "border-amber-200 bg-amber-50"
        }`}
      >
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-medium text-slate-500">{format(date, "EEE")}</p>
          <p className="text-sm font-semibold">{date.getDate()}</p>
        </div>

        <div className="mt-2 flex items-center gap-1">
          {vacationCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-600 px-2 py-0.5 text-[10px] font-semibold text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              {compact ? vacationCount : `Vacation ${vacationCount}`}
            </span>
          )}
          {sickCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              {compact ? sickCount : `Sick ${sickCount}`}
            </span>
          )}
          {eventCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-semibold text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              {compact ? eventCount : `Event ${eventCount}`}
            </span>
          )}
          {!hasItems && <span className="text-[11px] text-slate-400">No items</span>}
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Planner</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setMonth((value) => subMonths(value, 1))}>
            Prev
          </Button>
          <Button variant="secondary" onClick={() => setMonth((value) => addMonths(value, 1))}>
            Next
          </Button>
        </div>
      </div>

      <Card
        title={format(month, "MMMM yyyy")}
        subtitle={workdaysOnly ? "Workdays view" : "Month view"}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <Button
            variant={workdaysOnly ? "primary" : "secondary"}
            className="!px-2 !py-1 text-xs"
            onClick={() => setWorkdaysOnly((value) => !value)}
          >
            <CalendarDays size={14} />
            {workdaysOnly ? "Show all days" : "Show workdays only"}
          </Button>
          <p className="text-xs text-slate-500">
            Week starts on {weekStartsOn === 0 ? "Sunday" : "Monday"}
          </p>
        </div>

        {!workdaysOnly && (
          <>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500">
              {orderedWeekDays.map((weekday) => (
                <div key={weekday} className="py-1">
                  {WEEKDAY_LABELS[weekday]}
                </div>
              ))}
            </div>

            <div className="mt-1 grid grid-cols-7 gap-1">
              {calendarDays.map((date) => renderDayCell(date))}
            </div>
          </>
        )}

        {workdaysOnly && (
          <div className="overflow-x-auto">
            <div className="min-w-[360px]">
              <div
                className="grid gap-1 text-center text-xs text-slate-500"
                style={{ gridTemplateColumns: `repeat(${dominantWorkDays.length}, minmax(0, 1fr))` }}
              >
                {dominantWorkDays.map((weekday) => (
                  <div key={weekday} className="py-1">
                    {WEEKDAY_LABELS[weekday]}
                  </div>
                ))}
              </div>

              <div
                className="mt-1 grid gap-1"
                style={{ gridTemplateColumns: `repeat(${dominantWorkDays.length}, minmax(0, 1fr))` }}
              >
                {weeks.flatMap((week, weekIndex) =>
                  dominantWorkDays.map((weekday) => {
                    const date = week.find((value) => value.getDay() === weekday);
                    if (!date) {
                      return <div key={`empty-${weekIndex}-${weekday}`} />;
                    }
                    return (
                      <div key={`work-${formatDate(date)}-${weekday}`}>
                        {renderDayCell(date, true)}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </Card>

      <Modal
        open={Boolean(selectedDay)}
        onClose={() => setSelectedDay(null)}
        title={selectedDay ? format(selectedDay, "EEEE, MMMM d") : "Day details"}
      >
        {selectedDay && (
          <div className="space-y-3">
            {(() => {
              const items = dayItems(selectedDay);
              const iso = formatDate(selectedDay);
              return (
                <>
                  <p className="text-sm text-slate-500">Date: {iso}</p>

                  <div>
                    <p className="mb-2 text-sm font-semibold">Leaves</p>
                    <ul className="space-y-2">
                      {items.leaves.length === 0 && (
                        <li className="text-sm text-slate-500">No leave blocks.</li>
                      )}
                      {items.leaves.map((leave) => (
                        <li key={leave.id} className="rounded-lg border border-slate-200 p-2 text-sm">
                          <div className="flex justify-between">
                            <span>{leave.type}</span>
                            <Badge tone="sky">{leave.status}</Badge>
                          </div>
                          <p className="text-xs text-slate-500">
                            {leave.startDate} to {leave.endDate}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-semibold">Events</p>
                    <ul className="space-y-2">
                      {items.events.length === 0 && (
                        <li className="text-sm text-slate-500">No key events.</li>
                      )}
                      {items.events.map((event) => (
                        <li key={event.id} className="rounded-lg border border-slate-200 p-2 text-sm">
                          <p>{event.title}</p>
                          <p className="text-xs text-slate-500">{event.category}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </Modal>
    </div>
  );
};
