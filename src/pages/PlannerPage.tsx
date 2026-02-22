import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  startOfMonth,
  startOfWeek,
  subMonths
} from "date-fns";
import { useMemo, useState } from "react";
import { CalendarDays, CircleCheck, CircleDashed, CircleDot, CircleX } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Modal } from "../components/ui/Modal";
import { formatDate } from "../lib/date";
import { isWorkdayForDate } from "../lib/schedule";
import { useAppState } from "../state/AppContext";
import type { LeaveBlock } from "../types/app";

const WEEK_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const statusMeta: Record<LeaveBlock["status"], { label: string; className: string; icon: JSX.Element }> = {
  planned: {
    label: "Planned",
    className: "bg-slate-800 text-white",
    icon: <CircleDashed size={10} />
  },
  requested: {
    label: "Requested",
    className: "bg-amber-500 text-white",
    icon: <CircleDot size={10} />
  },
  approved: {
    label: "Approved",
    className: "bg-emerald-600 text-white",
    icon: <CircleCheck size={10} />
  },
  rejected: {
    label: "Rejected",
    className: "bg-rose-600 text-white",
    icon: <CircleX size={10} />
  }
};

export const PlannerPage = () => {
  const { activePlan } = useAppState();
  const [month, setMonth] = useState(new Date(activePlan.year, new Date().getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [workdaysOnly, setWorkdaysOnly] = useState(false);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const monthDays = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfMonth(month),
        end: endOfMonth(month)
      }),
    [month]
  );

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

  const visibleDays = useMemo(() => {
    if (!workdaysOnly) {
      return calendarDays;
    }

    return monthDays.filter((date) =>
      isWorkdayForDate(formatDate(date), activePlan.settings.scheduleRanges)
    );
  }, [activePlan.settings.scheduleRanges, calendarDays, monthDays, workdaysOnly]);

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
        subtitle={workdaysOnly ? "Workdays only" : "Tap any day for details"}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <Button
            variant={workdaysOnly ? "primary" : "secondary"}
            className="!px-2 !py-1 text-xs"
            onClick={() => setWorkdaysOnly((value) => !value)}
          >
            <CalendarDays size={14} />
            {workdaysOnly ? "All days" : "Workdays only"}
          </Button>
          <p className="text-xs text-slate-500">Week starts on Monday</p>
        </div>

        {!workdaysOnly && (
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500">
            {WEEK_HEADERS.map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>
        )}

        <div className={`mt-1 grid gap-1 ${workdaysOnly ? "grid-cols-2 sm:grid-cols-5" : "grid-cols-7"}`}>
          {visibleDays.map((date) => {
            const iso = formatDate(date);
            const inMonth = date.getMonth() === month.getMonth();
            const items = dayItems(date);
            const isWorkday = isWorkdayForDate(iso, activePlan.settings.scheduleRanges);
            const vacationCount = items.leaves.filter((leave) => leave.type === "vacation").length;
            const sickCount = items.leaves.filter((leave) => leave.type === "sick").length;
            const eventCount = items.events.length;
            const status = items.leaves[0]?.status;

            return (
              <button
                key={iso}
                onClick={() => setSelectedDay(date)}
                className={`rounded-xl border p-2 text-left transition ${
                  workdaysOnly ? "min-h-24" : "min-h-20"
                } ${inMonth ? "bg-white" : "bg-slate-50 text-slate-400"} ${
                  isWorkday ? "border-slate-200" : "border-amber-200 bg-amber-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold">{date.getDate()}</p>
                  {status && (
                    <span
                      className={`hidden items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium sm:inline-flex ${statusMeta[status].className}`}
                    >
                      {statusMeta[status].icon}
                      {statusMeta[status].label}
                    </span>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap gap-1 sm:hidden">
                  {vacationCount > 0 && (
                    <span className="rounded bg-sky-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      V {vacationCount}
                    </span>
                  )}
                  {sickCount > 0 && (
                    <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      S {sickCount}
                    </span>
                  )}
                  {eventCount > 0 && (
                    <span className="rounded bg-violet-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      E {eventCount}
                    </span>
                  )}
                </div>

                <div className="mt-2 hidden space-y-1 sm:block">
                  {items.leaves.slice(0, 2).map((leave) => (
                    <span
                      key={leave.id}
                      className={`block truncate rounded px-1.5 py-1 text-[10px] font-semibold ${
                        leave.type === "vacation"
                          ? "bg-sky-600 text-white"
                          : "bg-emerald-600 text-white"
                      }`}
                    >
                      {leave.type === "vacation" ? "Vacation" : "Sick"} • {statusMeta[leave.status].label}
                    </span>
                  ))}
                  {items.events.slice(0, 1).map((event) => (
                    <span
                      key={event.id}
                      className="block truncate rounded bg-violet-600 px-1.5 py-1 text-[10px] font-semibold text-white"
                    >
                      Event • {event.title}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
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
