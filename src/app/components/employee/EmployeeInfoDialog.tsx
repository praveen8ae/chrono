import { useEffect, useState } from 'react';
import { CalendarDays, Clock3, Mail, Phone, X } from 'lucide-react';
import { addMonths, eachDayOfInterval, endOfMonth, format, startOfMonth } from 'date-fns';
import { useRosterStore } from '../../store/rosterStore';
import { Employee } from '../../types/employee';
import { Assignment } from '../../types/assignment';
import { db } from '../../../lib/db';

type EmployeeInfoDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
};

type DayCell = {
  date: Date;
  dateKey: string;
  assignment: Assignment | null;
};

type MonthBlock = {
  month: Date;
  assignments: Assignment[];
};

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthOffsets = [-3, -2, -1, 0, 1, 2, 3];

const shiftLabel = (shift: Employee['assignedShift']) => {
  if (shift === 'shift1') return 'Shift 1';
  if (shift === 'shift2') return 'Shift 2';
  if (shift === 'shift3') return 'Shift 3';
  return 'Available';
};

const statusLabel = (status: Assignment['status']) => {
  switch (status) {
    case 'present':
      return 'Present';
    case 'scheduled':
      return 'Scheduled';
    case 'half-day':
      return 'Half Day';
    case 'absent':
      return 'Absent';
    case 'leave':
      return 'Leave';
    case 'off':
      return 'Week Off';
  }
};

const statusStyles: Record<Assignment['status'], string> = {
  present: 'bg-green-500/15 text-green-600 border-green-500/20',
  scheduled: 'bg-blue-500/15 text-blue-600 border-blue-500/20',
  'half-day': 'bg-yellow-500/15 text-yellow-600 border-yellow-500/20',
  absent: 'bg-red-500/15 text-red-600 border-red-500/20',
  off: 'bg-gray-500/15 text-gray-600 border-gray-500/20',
  leave: 'bg-purple-500/15 text-purple-600 border-purple-500/20',
};

export function EmployeeInfoDialog({ isOpen, onClose, employee }: EmployeeInfoDialogProps) {
  const { assignments, currentMonth } = useRosterStore();
  const [monthBlocks, setMonthBlocks] = useState<MonthBlock[]>([]);
  const [isLoadingMonths, setIsLoadingMonths] = useState(false);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;

    const loadMonths = async () => {
      if (!isOpen || !employee) return;

      setIsLoadingMonths(true);
      const blocks = await Promise.all(
        monthOffsets.map(async (offset) => {
          const month = addMonths(currentMonth, offset);
          const assignmentsForMonth = await db.assignments.getByMonth(month.getFullYear(), month.getMonth());
          return {
            month,
            assignments: assignmentsForMonth.filter((assignment) => assignment.employeeId === employee.id),
          };
        }),
      );

      if (!cancelled) {
        setMonthBlocks(blocks);
        setIsLoadingMonths(false);
      }
    };

    loadMonths().catch((error) => {
      console.error('Failed to load employee calendar months:', error);
      if (!cancelled) {
        setMonthBlocks([]);
        setIsLoadingMonths(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [currentMonth, employee, isOpen]);

  if (!isOpen || !employee) return null;
  const employeeAssignments = assignments.filter(
    (assignment) => assignment.employeeId === employee.id,
  );

  const weekOffs = employeeAssignments.filter((assignment) => assignment.status === 'off');
  const weekOffMap = weekOffs.reduce<Record<string, number>>((accumulator, assignment) => {
    const weekday = format(new Date(assignment.date), 'EEEE');
    accumulator[weekday] = (accumulator[weekday] || 0) + 1;
    return accumulator;
  }, {});

  const weekOffEntries = Object.entries(weekOffMap).sort((left, right) => right[1] - left[1]);
  const leaveDays = employeeAssignments.filter((assignment) => assignment.status === 'leave').length;
  const presentDays = employeeAssignments.filter(
    (assignment) => assignment.status === 'present' || assignment.status === 'scheduled',
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <CalendarDays className="w-4 h-4" />
              <span>{format(currentMonth, 'MMMM yyyy')} calendar</span>
            </div>
            <h2 className="mb-2">{employee.name}</h2>
            <p className="text-muted-foreground">
              {employee.role} · {employee.department} · {shiftLabel(employee.assignedShift)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            aria-label="Close employee details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-0 flex-1 overflow-hidden">
          <aside className="border-b lg:border-b-0 lg:border-r border-border p-6 space-y-6 overflow-y-auto">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{employee.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{employee.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock3 className="w-4 h-4 text-muted-foreground" />
                <span>{shiftLabel(employee.assignedShift)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border p-4 bg-muted/20">
                <p className="text-xs text-muted-foreground mb-1">Working / Scheduled</p>
                <p className="text-2xl font-semibold">{presentDays}</p>
              </div>
              <div className="rounded-xl border border-border p-4 bg-muted/20">
                <p className="text-xs text-muted-foreground mb-1">Week Offs</p>
                <p className="text-2xl font-semibold">{weekOffs.length}</p>
              </div>
              <div className="rounded-xl border border-border p-4 bg-muted/20">
                <p className="text-xs text-muted-foreground mb-1">Leave Days</p>
                <p className="text-2xl font-semibold">{leaveDays}</p>
              </div>
              <div className="rounded-xl border border-border p-4 bg-muted/20">
                <p className="text-xs text-muted-foreground mb-1">Monthly Records</p>
                <p className="text-2xl font-semibold">{employeeAssignments.length}</p>
              </div>
            </div>

            <div>
              <h3 className="mb-3">Week Off Pattern</h3>
              {weekOffEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground">No week off data for this month.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {weekOffEntries.map(([weekday, count]) => (
                    <span
                      key={weekday}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-border bg-muted/30 text-sm"
                    >
                      {weekday}
                      <span className="text-muted-foreground">{count}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </aside>

          <section className="p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3>Monthly Calendar</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-600">Present</span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-500/10 text-gray-600">Week Off</span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-500/10 text-purple-600">Leave</span>
              </div>
            </div>

            {isLoadingMonths ? (
              <div className="py-16 text-center text-muted-foreground">Loading calendar months...</div>
            ) : (
              <div className="space-y-6">
                {monthBlocks.map(({ month, assignments: monthAssignments }) => {
                  const monthStart = startOfMonth(month);
                  const monthEnd = endOfMonth(month);
                  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
                  const firstWeekday = monthStart.getDay();

                  const calendarDays: DayCell[] = [
                    ...Array.from({ length: firstWeekday }, () => ({
                      date: monthStart,
                      dateKey: '',
                      assignment: null,
                    })),
                    ...monthDays.map((date) => {
                      const dateKey = format(date, 'yyyy-MM-dd');
                      return {
                        date,
                        dateKey,
                        assignment: monthAssignments.find((assignment) => assignment.date === dateKey) || null,
                      };
                    }),
                  ];

                  while (calendarDays.length % 7 !== 0) {
                    calendarDays.push({ date: monthEnd, dateKey: '', assignment: null });
                  }

                  return (
                    <div key={format(month, 'yyyy-MM')} className="rounded-2xl border border-border bg-muted/10 p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4>{format(month, 'MMMM yyyy')}</h4>
                        <p className="text-xs text-muted-foreground">Scroll for more months</p>
                      </div>

                      <div className="grid grid-cols-7 gap-2 mb-2 text-xs text-muted-foreground">
                        {weekdayLabels.map((label) => (
                          <div key={`${format(month, 'yyyy-MM')}-${label}`} className="text-center py-2">
                            {label}
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-2">
                        {calendarDays.map((day, index) => {
                          if (!day.dateKey) {
                            return (
                              <div
                                key={`empty-${format(month, 'yyyy-MM')}-${index}`}
                                className="min-h-28 rounded-xl border border-dashed border-border/60 bg-background"
                              />
                            );
                          }

                          const assignment = day.assignment;
                          const status = assignment?.status;

                          return (
                            <div
                              key={day.dateKey}
                              className={`min-h-28 rounded-xl border p-3 ${
                                status ? statusStyles[status] : 'border-border bg-background'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2 mb-3">
                                <div>
                                  <p className="text-sm font-medium">{format(day.date, 'd')}</p>
                                  <p className="text-[11px] opacity-70">{format(day.date, 'EEE')}</p>
                                </div>
                                {status && (
                                  <span className="text-[11px] px-2 py-1 rounded-full border border-current/20">
                                    {statusLabel(status)}
                                  </span>
                                )}
                              </div>

                              {assignment ? (
                                <div className="space-y-1 text-xs">
                                  <p>{assignment.shiftType ? assignment.shiftType.toUpperCase() : 'No shift'}</p>
                                  <p className="opacity-80">{assignment.notes || 'No notes added'}</p>
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground">No record</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}