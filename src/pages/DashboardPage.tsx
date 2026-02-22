import {
  CalendarDays,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  TriangleAlert,
  ThermometerSun,
  Trees,
  XCircle
} from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { buildDashboardMetrics } from "../lib/metrics";
import { calculateLeaveDayUnits } from "../lib/leave";
import { EVENT_CATEGORY_ICONS } from "../lib/constants";
import { useAppState } from "../state/AppContext";

export const DashboardPage = () => {
  const { activePlan, setLeaveStatus } = useAppState();
  const metrics = buildDashboardMetrics(activePlan);

  const upcomingEvents = activePlan.events
    .filter((event) => new Date(event.endDate) >= new Date())
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 3);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2">
        <LayoutDashboard className="h-5 w-5 text-sky-600" />
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100">
              <Trees className="h-5 w-5 text-sky-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Used</p>
              <p className="text-xl font-bold">{metrics.approvedUsed.toFixed(1)}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100">
              <CalendarDays className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Planned</p>
              <p className="text-xl font-bold">{metrics.plannedUsed.toFixed(1)}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Remaining</p>
              <p className="text-xl font-bold">{metrics.remainingApproved.toFixed(1)}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
              <ThermometerSun className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Sick days</p>
              <p className="text-xl font-bold">{metrics.sickYearly.toFixed(1)}</p>
            </div>
          </div>
        </Card>
      </div>

      {metrics.daysToTakeToAvoidForfeit > 0 && (
        <p className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-700">
          <TriangleAlert className="h-4 w-4" />
          Take {metrics.daysToTakeToAvoidForfeit.toFixed(1)} days to avoid forfeit.
        </p>
      )}

      {metrics.pendingApprovals.length > 0 && (
        <Card
          title="Pending approvals"
          subtitle="Approve or reject requested vacation directly from dashboard"
          right={<Clock className="h-4 w-4 text-amber-500" />}
        >
          <div className="space-y-2">
            {metrics.pendingApprovals.map((leave) => (
              <div
                key={leave.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 p-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {leave.startDate} to {leave.endDate}
                  </p>
                  <p className="text-xs text-slate-500">
                    {calculateLeaveDayUnits(
                      leave,
                      activePlan.settings.scheduleRanges,
                      activePlan.holidays
                    ).toFixed(1)}{" "}
                    days
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="!px-2 !py-1 text-xs"
                    onClick={() => setLeaveStatus(leave.id, "approved")}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                  </Button>
                  <Button
                    variant="secondary"
                    className="!px-2 !py-1 text-xs text-rose-600"
                    onClick={() => setLeaveStatus(leave.id, "rejected")}
                  >
                    <XCircle className="h-3.5 w-3.5" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card title="Upcoming (next 60 days)">
        <ul className="space-y-2 text-sm">
          {metrics.upcoming.length === 0 && <li className="text-slate-500">Nothing upcoming.</li>}
          {metrics.upcoming.map((item) => (
            <li key={`${item.kind}-${item.id}`} className="flex items-center justify-between">
              <span>{item.title}</span>
              <div className="flex items-center gap-2">
                <Badge tone={item.kind === "leave" ? "sky" : "mint"}>{item.kind}</Badge>
                <span className="text-slate-500">{item.date}</span>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      {upcomingEvents.length > 0 && (
        <Card title="Upcoming events">
          <ul className="space-y-2 text-sm">
            {upcomingEvents.map((event) => (
              <li
                key={event.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-2"
              >
                <span>
                  {(EVENT_CATEGORY_ICONS[event.category] ?? EVENT_CATEGORY_ICONS.other) + " "}
                  {event.title}
                </span>
                <span className="text-slate-500">{event.startDate}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};
