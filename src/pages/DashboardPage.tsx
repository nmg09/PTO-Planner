import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { useAppState } from "../state/AppContext";
import { buildDashboardMetrics } from "../lib/metrics";

export const DashboardPage = () => {
  const { activePlan } = useAppState();
  const metrics = buildDashboardMetrics(activePlan);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Dashboard {activePlan.year}</h1>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card title="Vacation" subtitle="Planned vs approved">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-slate-500">Planned used</p>
              <p className="text-lg font-semibold">{metrics.plannedUsed.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-slate-500">Approved used</p>
              <p className="text-lg font-semibold">{metrics.approvedUsed.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-slate-500">Remaining planned</p>
              <p className="text-lg font-semibold">{metrics.remainingPlanned.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-slate-500">Remaining approved</p>
              <p className="text-lg font-semibold">{metrics.remainingApproved.toFixed(1)}</p>
            </div>
          </div>
        </Card>

        <Card title="Carryover and forfeit" subtitle="Based on approved remaining">
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <p className="text-slate-500">Carry estimate</p>
              <p className="font-semibold">{metrics.carryEstimate.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-slate-500">Forfeited</p>
              <p className="font-semibold text-rose-600">{metrics.forfeited.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-slate-500">Days to take</p>
              <p className="font-semibold text-amber-600">
                {metrics.daysToTakeToAvoidForfeit.toFixed(1)}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Sick leave logged: {metrics.sickYearly.toFixed(1)} days
          </p>
        </Card>
      </div>

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

      <Card title="Pending approvals">
        <ul className="space-y-2 text-sm">
          {metrics.pendingApprovals.length === 0 && (
            <li className="text-slate-500">No pending requests.</li>
          )}
          {metrics.pendingApprovals.map((leave) => (
            <li key={leave.id} className="flex items-center justify-between">
              <span>
                {leave.startDate} to {leave.endDate}
              </span>
              <Badge tone="amber">requested</Badge>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};
