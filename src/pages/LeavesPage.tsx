import { format, parseISO } from "date-fns";
import { CalendarRange, Pencil, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Select } from "../components/ui/Inputs";
import { LeaveForm } from "../components/leaves/LeaveForm";
import { Modal } from "../components/ui/Modal";
import { LEAVE_STATUS_OPTIONS, LEAVE_TYPE_OPTIONS } from "../lib/constants";
import { calculateLeaveDayUnits } from "../lib/leave";
import { useAppState } from "../state/AppContext";
import type { LeaveBlock } from "../types/app";

const formatLeaveRange = (startDate: string, endDate: string) => {
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

export const LeavesPage = () => {
  const { activePlan, addLeave, updateLeave, removeLeave, setLeaveStatus } = useAppState();
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [editing, setEditing] = useState<LeaveBlock | null>(null);
  const [isOpen, setOpen] = useState(false);

  const months = Array.from(new Set(activePlan.leaves.map((leave) => leave.startDate.slice(0, 7)))).sort();

  const filtered = useMemo(
    () =>
      activePlan.leaves
        .filter((leave) => filterType === "all" || leave.type === filterType)
        .filter((leave) => filterStatus === "all" || leave.status === filterStatus)
        .filter((leave) => filterMonth === "all" || leave.startDate.startsWith(filterMonth))
        .sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [activePlan.leaves, filterMonth, filterStatus, filterType]
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
          <CalendarRange className="h-5 w-5 text-sky-600" />
          <h1 className="text-2xl font-bold tracking-tight">Leaves</h1>
        </div>
        <div className="flex justify-end">
          <Button className="hidden md:inline-flex" onClick={openAdd}>
            <Plus className="h-4 w-4" /> Add leave
          </Button>
        </div>
      </div>

      <Card title="Filters">
        <div className="grid grid-cols-3 gap-2">
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
            const units = calculateLeaveDayUnits(
              leave,
              activePlan.settings.scheduleRanges,
              activePlan.holidays
            );
            const safeStatus = leave.type === "sick" ? "approved" : leave.status;
            return (
              <li key={leave.id} className="relative rounded-xl border border-slate-100 p-3">
                <button
                  className="absolute right-2 top-2 rounded-lg p-1 text-slate-500 hover:bg-slate-100"
                  aria-label="Edit leave"
                  onClick={() => {
                    setEditing(leave);
                    setOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </button>

                <div className="pr-8">
                  <p className="font-medium capitalize">{leave.type} leave</p>
                  <p className="text-sm text-slate-600">{formatLeaveRange(leave.startDate, leave.endDate)}</p>
                  <p className="text-xs text-slate-500">{units.toFixed(1)} day units</p>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Select
                    className="max-w-[170px]"
                    value={safeStatus}
                    disabled={leave.type === "sick"}
                    onChange={(event) =>
                      setLeaveStatus(leave.id, event.target.value as LeaveBlock["status"])
                    }
                  >
                    {LEAVE_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </Select>
                  {leave.startFraction === 0.5 && <Badge tone="slate">half start</Badge>}
                  {leave.endFraction === 0.5 && <Badge tone="slate">half end</Badge>}
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      <button
        className="fixed bottom-28 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-sky-400 bg-gradient-to-b from-sky-500 to-sky-600 text-white shadow-[0_18px_26px_rgba(14,165,233,0.35)] md:hidden"
        aria-label="Add leave"
        onClick={openAdd}
      >
        <Plus className="h-6 w-6" />
      </button>

      <Modal open={isOpen} onClose={() => setOpen(false)} title={editing ? "Edit leave" : "Add leave"}>
        <LeaveForm
          initial={editing ?? undefined}
          defaultCountOnlyWorkdays={activePlan.settings.defaultCountOnlyWorkdays}
          scheduleRanges={activePlan.settings.scheduleRanges}
          holidays={activePlan.holidays}
          events={activePlan.events}
          onCancel={() => setOpen(false)}
          onDelete={
            editing
              ? () => {
                  removeLeave(editing.id);
                  setOpen(false);
                }
              : undefined
          }
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
