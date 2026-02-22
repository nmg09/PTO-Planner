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
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Modal } from "../components/ui/Modal";
import { formatDate } from "../lib/date";
import { isWorkdayForDate } from "../lib/schedule";
import { useAppState } from "../state/AppContext";

export const PlannerPage = () => {
  const { activePlan } = useAppState();
  const [month, setMonth] = useState(new Date(activePlan.year, new Date().getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [month]);

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

      <Card title={format(month, "MMMM yyyy")} subtitle="Tap any day for details">
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1">
          {calendarDays.map((date) => {
            const iso = formatDate(date);
            const inMonth = date.getMonth() === month.getMonth();
            const items = dayItems(date);
            const isWorkday = isWorkdayForDate(iso, activePlan.settings.scheduleRanges);

            return (
              <button
                key={iso}
                onClick={() => setSelectedDay(date)}
                className={`min-h-20 rounded-xl border p-1 text-left transition ${
                  inMonth ? "bg-white" : "bg-slate-50 text-slate-400"
                } ${isWorkday ? "border-slate-200" : "border-amber-200 bg-amber-50"}`}
              >
                <p className="text-xs font-medium">{date.getDate()}</p>
                <div className="mt-1 space-y-1">
                  {items.leaves.slice(0, 1).map((leave) => (
                    <span
                      key={leave.id}
                      className={`block truncate rounded px-1 py-0.5 text-[10px] ${
                        leave.type === "vacation"
                          ? "bg-sky-100 text-sky-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {leave.type}
                    </span>
                  ))}
                  {items.events.slice(0, 1).map((event) => (
                    <span
                      key={event.id}
                      className="block truncate rounded bg-violet-100 px-1 py-0.5 text-[10px] text-violet-700"
                    >
                      {event.title}
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
