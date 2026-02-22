import { useMemo, useState } from "react";
import { isAfter } from "date-fns";
import { Button } from "../ui/Button";
import { Input, Select, Textarea } from "../ui/Inputs";
import { LEAVE_STATUS_OPTIONS, LEAVE_TYPE_OPTIONS } from "../../lib/constants";
import { calculateLeaveDayUnits } from "../../lib/leave";
import type { KeyEvent, LeaveBlock, WorkScheduleRange } from "../../types/app";
import { parseDate } from "../../lib/date";

type LeaveDraft = Omit<LeaveBlock, "id">;

type LeaveFormProps = {
  initial?: LeaveBlock;
  defaultCountOnlyWorkdays: boolean;
  scheduleRanges: WorkScheduleRange[];
  events: KeyEvent[];
  onSave: (leave: LeaveDraft) => void;
  onCancel: () => void;
};

const today = new Date().toISOString().slice(0, 10);

export const LeaveForm = ({
  initial,
  defaultCountOnlyWorkdays,
  scheduleRanges,
  events,
  onSave,
  onCancel
}: LeaveFormProps) => {
  const [form, setForm] = useState<LeaveDraft>(
    initial
      ? { ...initial }
      : {
          type: "vacation",
          startDate: today,
          endDate: today,
          countOnlyWorkdays: defaultCountOnlyWorkdays,
          startFraction: 1,
          endFraction: 1,
          status: "planned",
          linkedEventId: undefined,
          note: ""
        }
  );

  const preview = useMemo(
    () =>
      calculateLeaveDayUnits(
        { id: "preview", ...form },
        scheduleRanges
      ).toFixed(1),
    [form, scheduleRanges]
  );
  const dateRangeError = isAfter(parseDate(form.startDate), parseDate(form.endDate))
    ? "Start date must be on or before end date."
    : null;

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (dateRangeError) {
          return;
        }
        const safeStatus = form.type === "sick" ? "approved" : form.status;
        onSave({ ...form, status: safeStatus });
      }}
    >
      <div className="grid grid-cols-2 gap-2">
        <label className="space-y-1 text-xs">
          Type
          <Select
            value={form.type}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                type: event.target.value as LeaveBlock["type"],
                status:
                  event.target.value === "sick"
                    ? "approved"
                    : prev.status === "rejected"
                      ? "planned"
                      : prev.status
              }))
            }
          >
            {LEAVE_TYPE_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
        </label>

        <label className="space-y-1 text-xs">
          Status
          <Select
            value={form.status}
            disabled={form.type === "sick"}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                status: event.target.value as LeaveBlock["status"]
              }))
            }
          >
            {LEAVE_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="space-y-1 text-xs">
          Start date
          <Input
            type="date"
            className={dateRangeError ? "border-rose-400 focus:border-rose-400" : ""}
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
            className={dateRangeError ? "border-rose-400 focus:border-rose-400" : ""}
            value={form.endDate}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, endDate: event.target.value }))
            }
            required
          />
        </label>
      </div>

      {dateRangeError && <p className="text-sm text-rose-600">{dateRangeError}</p>}

      <div className="grid grid-cols-2 gap-2">
        <label className="space-y-1 text-xs">
          Start fraction
          <Select
            value={String(form.startFraction)}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                startFraction: Number(event.target.value) as 1 | 0.5
              }))
            }
          >
            <option value="1">1.0</option>
            <option value="0.5">0.5</option>
          </Select>
        </label>

        <label className="space-y-1 text-xs">
          End fraction
          <Select
            value={String(form.endFraction)}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                endFraction: Number(event.target.value) as 1 | 0.5
              }))
            }
          >
            <option value="1">1.0</option>
            <option value="0.5">0.5</option>
          </Select>
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.countOnlyWorkdays}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, countOnlyWorkdays: event.target.checked }))
          }
        />
        Count only workdays
      </label>

      <label className="space-y-1 text-xs">
        Linked event
        <Select
          value={form.linkedEventId ?? ""}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              linkedEventId: event.target.value || undefined
            }))
          }
        >
          <option value="">None</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </Select>
      </label>

      <label className="space-y-1 text-xs">
        Note
        <Textarea
          rows={3}
          value={form.note ?? ""}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, note: event.target.value }))
          }
        />
      </label>

      <p className="rounded-xl bg-slate-100 px-3 py-2 text-sm">
        This uses <strong>{preview}</strong> {form.type === "vacation" ? "vacation" : "sick"}{" "}
        days.
      </p>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={Boolean(dateRangeError)}>
          Save leave
        </Button>
      </div>
    </form>
  );
};
