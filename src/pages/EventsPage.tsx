import { useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Modal } from "../components/ui/Modal";
import { EventForm } from "../components/events/EventForm";
import { useAppState } from "../state/AppContext";
import type { KeyEvent } from "../types/app";

export const EventsPage = () => {
  const { activePlan, addEvent, updateEvent, removeEvent } = useAppState();
  const [editing, setEditing] = useState<KeyEvent | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Events</h1>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          Add event
        </Button>
      </div>

      <Card title="Key events">
        <ul className="space-y-3">
          {activePlan.events.length === 0 && (
            <li className="text-sm text-slate-500">No events yet.</li>
          )}
          {activePlan.events
            .slice()
            .sort((a, b) => a.startDate.localeCompare(b.startDate))
            .map((event) => (
              <li key={event.id} className="rounded-xl border border-slate-100 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-xs text-slate-500">
                      {event.startDate} to {event.endDate}
                    </p>
                  </div>
                  <Badge tone="mint">{event.category}</Badge>
                </div>
                {event.location && (
                  <p className="mt-1 text-xs text-slate-600">Location: {event.location}</p>
                )}
                {event.note && <p className="mt-1 text-xs text-slate-600">{event.note}</p>}

                <div className="mt-2 flex gap-2">
                  <Button
                    variant="secondary"
                    className="!text-xs"
                    onClick={() => {
                      setEditing(event);
                      setOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    className="!text-xs"
                    onClick={() => removeEvent(event.id)}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
        </ul>
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit event" : "Add event"}
      >
        <EventForm
          initial={editing ?? undefined}
          onCancel={() => setOpen(false)}
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
