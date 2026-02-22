import { format, parseISO } from "date-fns";
import { PartyPopper, Pencil, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Select } from "../components/ui/Inputs";
import { Modal } from "../components/ui/Modal";
import { EventForm } from "../components/events/EventForm";
import { EVENT_CATEGORY_ICONS, EVENT_CATEGORY_OPTIONS } from "../lib/constants";
import { useAppState } from "../state/AppContext";
import type { KeyEvent } from "../types/app";

const formatEventRange = (startDate: string, endDate: string) => {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  if (startDate === endDate) {
    return format(start, "MMMM d");
  }
  if (start.getMonth() === end.getMonth()) {
    return `${format(start, "MMMM d")} to ${format(end, "d")}`;
  }
  return `${format(start, "MMMM d")} to ${format(end, "MMMM d")}`;
};

export const EventsPage = () => {
  const { activePlan, addEvent, updateEvent, removeEvent } = useAppState();
  const [editing, setEditing] = useState<KeyEvent | null>(null);
  const [open, setOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");

  const months = Array.from(new Set(activePlan.events.map((event) => event.startDate.slice(0, 7)))).sort();

  const filtered = useMemo(
    () =>
      activePlan.events
        .filter((event) => filterCategory === "all" || event.category === filterCategory)
        .filter((event) => filterMonth === "all" || event.startDate.startsWith(filterMonth))
        .slice()
        .sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [activePlan.events, filterCategory, filterMonth]
  );

  const openAdd = () => {
    setEditing(null);
    setOpen(true);
  };

  return (
    <div className="space-y-4 pb-24 md:pb-0">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center">
        <div />
        <div className="flex items-center justify-center gap-2">
          <PartyPopper className="h-5 w-5 text-sky-600" />
          <h1 className="text-2xl font-bold tracking-tight">Events</h1>
        </div>
        <div className="flex justify-end">
          <Button className="hidden md:inline-flex" onClick={openAdd}>
            <Plus className="h-4 w-4" /> Add event
          </Button>
        </div>
      </div>

      <Card title="Filters">
        <div className="grid grid-cols-2 gap-2">
          <Select value={filterCategory} onChange={(event) => setFilterCategory(event.target.value)}>
            <option value="all">All categories</option>
            {EVENT_CATEGORY_OPTIONS.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
          <Select value={filterMonth} onChange={(event) => setFilterMonth(event.target.value)}>
            <option value="all">All months</option>
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Card title="Key events">
        <ul className="space-y-3">
          {filtered.length === 0 && <li className="text-sm text-slate-500">No events yet.</li>}
          {filtered.map((event) => (
            <li key={event.id} className="relative rounded-xl border border-slate-100 p-3">
              <button
                className="absolute right-2 top-2 rounded-lg p-1 text-slate-500 hover:bg-slate-100"
                aria-label="Edit event"
                onClick={() => {
                  setEditing(event);
                  setOpen(true);
                }}
              >
                <Pencil className="h-4 w-4" />
              </button>

              <div className="pr-8">
                <p className="font-medium">
                  {(EVENT_CATEGORY_ICONS[event.category] ?? EVENT_CATEGORY_ICONS.other) + " "}
                  {event.title}
                </p>
                <p className="text-sm text-slate-600">{formatEventRange(event.startDate, event.endDate)}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge tone="mint">{event.category}</Badge>
                  {event.location && <span className="text-xs text-slate-500">{event.location}</span>}
                </div>
                {event.note && <p className="mt-1 text-xs text-slate-600">{event.note}</p>}
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <button
        className="fixed bottom-28 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-sky-400 bg-gradient-to-b from-sky-500 to-sky-600 text-white shadow-[0_18px_26px_rgba(14,165,233,0.35)] md:hidden"
        aria-label="Add event"
        onClick={openAdd}
      >
        <Plus className="h-6 w-6" />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit event" : "Add event"}>
        <EventForm
          initial={editing ?? undefined}
          onCancel={() => setOpen(false)}
          onDelete={
            editing
              ? () => {
                  removeEvent(editing.id);
                  setOpen(false);
                }
              : undefined
          }
          onSave={(data) => {
            if (editing) {
              updateEvent({ ...editing, ...data });
            } else {
              addEvent({ id: crypto.randomUUID(), ...data });
            }
            setOpen(false);
          }}
        />
      </Modal>
    </div>
  );
};
