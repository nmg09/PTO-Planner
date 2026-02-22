import { useState } from "react";
import { EVENT_CATEGORY_OPTIONS } from "../../lib/constants";
import type { KeyEvent } from "../../types/app";
import { Button } from "../ui/Button";
import { Input, Select, Textarea } from "../ui/Inputs";

type EventDraft = Omit<KeyEvent, "id">;

type EventFormProps = {
  initial?: KeyEvent;
  onSave: (event: EventDraft) => void;
  onCancel: () => void;
};

const today = new Date().toISOString().slice(0, 10);

export const EventForm = ({ initial, onSave, onCancel }: EventFormProps) => {
  const [form, setForm] = useState<EventDraft>(
    initial
      ? { ...initial }
      : {
          title: "",
          category: "other",
          startDate: today,
          endDate: today,
          location: "",
          note: ""
        }
  );

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(form);
      }}
    >
      <label className="space-y-1 text-xs">
        Title
        <Input
          value={form.title}
          onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
          required
        />
      </label>

      <label className="space-y-1 text-xs">
        Category
        <Select
          value={form.category}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, category: event.target.value as KeyEvent["category"] }))
          }
        >
          {EVENT_CATEGORY_OPTIONS.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="space-y-1 text-xs">
          Start date
          <Input
            type="date"
            value={form.startDate}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, startDate: event.target.value }))
            }
            required
          />
        </label>
        <label className="space-y-1 text-xs">
          End date
          <Input
            type="date"
            value={form.endDate}
            onChange={(event) => setForm((prev) => ({ ...prev, endDate: event.target.value }))}
            required
          />
        </label>
      </div>

      <label className="space-y-1 text-xs">
        Location
        <Input
          value={form.location ?? ""}
          onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
        />
      </label>

      <label className="space-y-1 text-xs">
        Note
        <Textarea
          rows={3}
          value={form.note ?? ""}
          onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
        />
      </label>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save event</Button>
      </div>
    </form>
  );
};
