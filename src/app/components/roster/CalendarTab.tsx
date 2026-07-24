import { Clock, LogIn, LogOut, Coffee } from 'lucide-react';
import { Assignment } from '../../types/assignment';
import { Employee } from '../../types/employee';
import { SHIFTS } from '../../types/shift';

type CalendarTabProps = {
  assignment: Assignment | null;
  employee: Employee;
  date: string | null;
};

type ScheduleItem = {
  time: string;
  title: string;
  detail: string;
  icon: typeof Clock;
  tone: string;
};

export function CalendarTab({ assignment, employee: _employee, date }: CalendarTabProps) {
  if (!assignment || assignment.status === 'off' || assignment.status === 'absent') {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>{assignment?.status === 'absent' ? 'Employee is on full day leave' : 'Employee is off this day'}</p>
      </div>
    );
  }

  const shift = assignment.shiftType ? SHIFTS[assignment.shiftType] : null;
  if (!shift || !shift.startTime || !shift.endTime) return null;

  const parseTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  const shiftStart = parseTime(shift.startTime);
  const schedule: ScheduleItem[] = [
    {
      time: shift.startTime,
      title: 'Login',
      detail: 'Shift begins',
      icon: LogIn,
      tone: 'border-green-500 bg-green-500/10 text-green-700',
    },
    {
      time: formatTime(shiftStart + 90),
      title: 'Break 1',
      detail: '15 minutes',
      icon: Coffee,
      tone: 'border-orange-500 bg-orange-500/10 text-orange-700',
    },
    {
      time: formatTime(shiftStart + 240),
      title: 'Lunch Break',
      detail: '30 minutes',
      icon: Coffee,
      tone: 'border-blue-500 bg-blue-500/10 text-blue-700',
    },
    {
      time: formatTime(shiftStart + 420),
      title: 'Break 2',
      detail: '15 minutes',
      icon: Coffee,
      tone: 'border-orange-500 bg-orange-500/10 text-orange-700',
    },
    {
      time: shift.endTime,
      title: 'Logout',
      detail: 'Shift ends',
      icon: LogOut,
      tone: 'border-red-500 bg-red-500/10 text-red-700',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="w-4 h-4" />
        <span>
          Schedule for {date ? new Date(date).toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric',
          }) : 'selected date'}
        </span>
      </div>

      <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
        <div className="relative space-y-3 before:absolute before:bottom-6 before:left-[3.35rem] before:top-6 before:w-px before:bg-border sm:before:left-[4.85rem]">
          {schedule.map((item) => {
            const Icon = item.icon;
            return (
              <div key={`${item.title}-${item.time}`} className="relative grid grid-cols-[3rem_1fr] items-center gap-3 sm:grid-cols-[4.5rem_1fr] sm:gap-4">
                <time className="text-right text-xs font-medium text-muted-foreground">{item.time}</time>
                <div className={`relative flex min-h-14 items-center gap-3 rounded-lg border-l-4 px-3 py-2 ${item.tone}`}>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-card shadow-sm">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm opacity-80">{item.detail}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
