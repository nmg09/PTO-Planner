import { useMemo, useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Modal } from "../components/ui/Modal";
import { Select } from "../components/ui/Inputs";
import { LeaveForm } from "../components/leaves/LeaveForm";
import { calculateLeaveDayUnits } from "../lib/leave";
import { LEAVE_STATUS_OPTIONS, LEAVE_TYPE_OPTIONS } from "../lib/constants";
import { useAppState } from "../state/AppContext";
import type { LeaveBlock } from "../types/app";

export const LeavesPage = () => {
  const { activePlan, addLeave, updateLeave, removeLeave, setLeaveStatus } = useAppState();

  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [editing, setEditing] = useState<LeaveBlock | null>(null);
  const [isOpen, setOpen] = useState(false);

  const months = Array.from(
    new Set(activePlan.leaves.map((leave) => leave.startDate.slice(0, 7)))
  ).sort();

  const filtered = useMemo(
    () =>
      activePlan.leaves
        .filter((leave) => filterType === "all" || leave.type === filterType)
        .filter((leave) => filterStatus === "all" || leave.status === filterStatus)
        .filter((leave) => filterMonth === "all" || leave.startDate.startsWith(filterMonth))
        .sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [activePlan.leaves, filterMonth, filterStatus, filterType]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Leaves</h1>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          Add leave
        </Button>
      </div>

      <Card title="Filters">
        <div className="grid gap-2 sm:grid-cols-3">
          <Select value={filterType} onChange={(event) => setFilterType(event.target.value)}>
            <option value="all">All types</option>
            {LEAVE_TYPE_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <Select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}>
            <option value="all">All statuses</option>
            {LEAVE_STATUS_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
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

      <Card title="Leave blocks">
        <ul className="space-y-3">
          {filtered.length === 0 && <li className="text-sm text-slate-500">No leave blocks.</li>}
          {filtered.map((leave) => {
            const units = calculateLeaveDayUnits(leave, activePlan.settings.scheduleRanges);
            return (
              <li key={leave.id} className="rounded-xl border border-slate-100 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium capitalize">
                      {leave.type} leave ({leave.startDate} to {leave.endDate})
                    </p>
                    <p className="text-xs text-slate-500">{units.toFixed(1)} day units</p>
                  </div>
                  <Badge tone={leave.status === "rejected" ? "rose" : "sky"}>{leave.status}</Badge>
                </div>

                {leave.type === "vacation" && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(["planned", "requested", "approved", "rejected"] as const).map((status) => (
                      <Button
                        key={status}
                        variant="ghost"
                        className="!px-2 !py-1 text-xs"
                        onClick={() => setLeaveStatus(leave.id, status)}
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
                )}

                <div className="mt-2 flex gap-2">
                  <Button
                    variant="secondary"
                    className="!text-xs"
                    onClick={() => {
                      setEditing(leave);
                      setOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    className="!text-xs"
                    onClick={() => removeLeave(leave.id)}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      <Modal
        open={isOpen}
        onClose={() => setOpen(false)}
        title={editing ? "Edit leave" : "Add leave"}
      >
        <LeaveForm
          initial={editing ?? undefined}
          defaultCountOnlyWorkdays={activePlan.settings.defaultCountOnlyWorkdays}
          scheduleRanges={activePlan.settings.scheduleRanges}
          events={activePlan.events}
          onCancel={() => setOpen(false)}
          onSave={(data) => {
            if (editing) {
              updateLeave({ ...editing, ...data });
            } else {
              addLeave({ id: crypto.randomUUID(), ...data });
            }
            setOpen(false);
          }}
        />
      </Modal>
    </div>
  );
};
