import { useEffect, useMemo } from 'react';
import { Activity, CalendarDays, ClipboardCheck, TrendingUp, Users } from 'lucide-react';
import { useRosterStore } from '../store/rosterStore';
import { useLeaveStore } from '../store/leaveStore';

const SHIFT_DETAILS = [
  { id: 'shift1', label: 'Shift 1', color: 'bg-blue-500' },
  { id: 'shift2', label: 'Shift 2', color: 'bg-orange-500' },
  { id: 'shift3', label: 'Shift 3', color: 'bg-purple-500' },
] as const;

const asLocalDate = (value: string) => new Date(`${value}T00:00:00`);

export function DashboardPage() {
  const { currentMonth, assignments, employees, activityLogs, loadAssignments } = useRosterStore();
  const { leaveRequests } = useLeaveStore();

  useEffect(() => {
    loadAssignments(currentMonth.getFullYear(), currentMonth.getMonth());
  }, [currentMonth, loadAssignments]);

  const metrics = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    const monthLogs = activityLogs.filter((log) => {
      const timestamp = new Date(log.timestamp);
      return timestamp.getFullYear() === year && timestamp.getMonth() === month;
    });

    const workingAssignments = assignments.filter((assignment) =>
      assignment.status !== 'off' && assignment.status !== 'leave',
    );
    const attendanceUnits = workingAssignments.reduce((total, assignment) => {
      if (assignment.status === 'half-day') return total + 0.5;
      if (assignment.status === 'absent') return total;
      return total + 1;
    }, 0);
    const attendanceRate = workingAssignments.length
      ? Math.round((attendanceUnits / workingAssignments.length) * 100)
      : 0;
    const taskAssignedEntries = workingAssignments.filter((assignment) =>
      (assignment.taskQueues?.length ?? 0) > 0,
    ).length;
    const productivityRate = workingAssignments.length
      ? Math.round((taskAssignedEntries / workingAssignments.length) * 100)
      : 0;

    const leavesByEmployee = new Map<string, { name: string; days: number; requests: number }>();
    leaveRequests
      .filter((request) => request.status === 'approved')
      .forEach((request) => {
        const leaveStart = asLocalDate(request.startDate);
        const leaveEnd = asLocalDate(request.endDate);
        const overlapStart = leaveStart > monthStart ? leaveStart : monthStart;
        const overlapEnd = leaveEnd < monthEnd ? leaveEnd : monthEnd;
        if (overlapStart > overlapEnd) return;

        const days = Math.floor((overlapEnd.getTime() - overlapStart.getTime()) / 86_400_000) + 1;
        const employee = employees.find((item) => item.id === request.employeeId);
        const existing = leavesByEmployee.get(request.employeeId) ?? {
          name: employee?.name ?? request.employeeName ?? request.employeeId,
          days: 0,
          requests: 0,
        };
        leavesByEmployee.set(request.employeeId, {
          ...existing,
          days: existing.days + days,
          requests: existing.requests + 1,
        });
      });

    const shiftCounts = SHIFT_DETAILS.map((shift) => ({
      ...shift,
      employees: new Set(
        assignments
          .filter((assignment) => assignment.shiftType === shift.id && assignment.status !== 'off')
          .map((assignment) => assignment.employeeId),
      ).size,
    }));

    return {
      monthLogs,
      attendanceRate,
      productivityRate,
      workingAssignments: workingAssignments.length,
      taskAssignedEntries,
      approvedLeaveDays: [...leavesByEmployee.values()].reduce((total, leave) => total + leave.days, 0),
      leavesByEmployee: [...leavesByEmployee.values()].sort((a, b) => b.days - a.days),
      shiftCounts,
      newEmployees: monthLogs.filter((log) => log.type === 'employee_added').length,
      removedEmployees: monthLogs.filter((log) => log.type === 'employee_deleted').length,
    };
  }, [activityLogs, assignments, currentMonth, employees, leaveRequests]);

  const monthLabel = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold mb-2">{monthLabel} overview</h2>
        <p className="text-muted-foreground">Metrics below reflect the roster month selected in the top bar.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Users} label="Current workforce" value={employees.length} detail={`${metrics.newEmployees} added · ${metrics.removedEmployees} removed this month`} tone="text-blue-600" />
        <MetricCard icon={TrendingUp} label="Attendance rate" value={`${metrics.attendanceRate}%`} detail="Present work entries, with half-days counted at 50%" tone="text-green-600" />
        <MetricCard icon={ClipboardCheck} label="Productivity rate" value={`${metrics.productivityRate}%`} detail={`${metrics.taskAssignedEntries} of ${metrics.workingAssignments} work entries have a task assigned`} tone="text-purple-600" />
        <MetricCard icon={CalendarDays} label="Approved leave" value={`${metrics.approvedLeaveDays} days`} detail="Days of approved leave that fall within this month" tone="text-orange-600" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-5 flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <h3>Workforce by shift</h3>
              <p className="text-sm text-muted-foreground">Distinct employees scheduled during {monthLabel}</p>
            </div>
          </div>
          <div className="space-y-4">
            {metrics.shiftCounts.map((shift) => {
              const total = metrics.shiftCounts.reduce((sum, item) => sum + item.employees, 0);
              const percentage = total ? Math.round((shift.employees / total) * 100) : 0;
              return (
                <div key={shift.id}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium"><span className={`h-2.5 w-2.5 rounded-full ${shift.color}`} />{shift.label}</span>
                    <span className="text-muted-foreground">{shift.employees} people · {percentage}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className={`h-full rounded-full ${shift.color}`} style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-5 flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-primary" />
            <div>
              <h3>Leave taken in {monthLabel}</h3>
              <p className="text-sm text-muted-foreground">Approved leave only</p>
            </div>
          </div>
          {metrics.leavesByEmployee.length === 0 ? (
            <p className="rounded-lg bg-muted/40 p-4 text-sm text-muted-foreground">No approved leave recorded for this month.</p>
          ) : (
            <div className="space-y-3">
              {metrics.leavesByEmployee.map((leave) => (
                <div key={leave.name} className="flex items-center justify-between rounded-lg bg-muted/40 p-3">
                  <span className="font-medium">{leave.name}</span>
                  <span className="text-sm text-muted-foreground">{leave.days} day{leave.days === 1 ? '' : 's'} · {leave.requests} request{leave.requests === 1 ? '' : 's'}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-5 flex items-center gap-3">
          <Activity className="h-5 w-5 text-primary" />
          <div>
            <h3>Monthly activity</h3>
            <p className="text-sm text-muted-foreground">Employee and shift changes recorded in {monthLabel}</p>
          </div>
        </div>
        {metrics.monthLogs.length === 0 ? (
          <p className="rounded-lg bg-muted/40 p-4 text-sm text-muted-foreground">No activity recorded for this month.</p>
        ) : (
          <div className="space-y-3">
            {metrics.monthLogs.map((log) => (
              <div key={log.id} className="rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-medium">{log.description}</p>
                  <time className="text-sm text-muted-foreground">{new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</time>
                </div>
                {log.details && <p className="mt-1 text-sm text-muted-foreground">{log.details}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

type MetricCardProps = {
  icon: typeof Users;
  label: string;
  value: string | number;
  detail: string;
  tone: string;
};

function MetricCard({ icon: Icon, label, value, detail, tone }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-3 flex items-center gap-3">
        <Icon className={`h-5 w-5 ${tone}`} />
        <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
      </div>
      <p className="text-3xl font-semibold">{value}</p>
      <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}
