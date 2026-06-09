import { Clock } from 'lucide-react';
import { Assignment } from '../../types/assignment';
import { Employee } from '../../types/employee';
import { SHIFTS } from '../../types/shift';

type CalendarTabProps = {
  assignment: Assignment | null;
  employee: Employee;
  date: string | null;
};

export function CalendarTab({ assignment, employee, date }: CalendarTabProps) {
  if (!assignment || assignment.status === 'off' || assignment.status === 'absent') {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>{assignment?.status === 'absent' ? 'Employee is on full day leave' : 'Employee is off this day'}</p>
      </div>
    );
  }

  const shift = assignment.shiftType ? SHIFTS[assignment.shiftType] : null;
  if (!shift || !shift.startTime || !shift.endTime) return null;

  // Parse times
  const parseTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes; // Convert to minutes from midnight
  };

  const startMinutes = parseTime(shift.startTime);
  const endMinutes = parseTime(shift.endTime);

  // Calculate shift duration
  let shiftDuration = endMinutes - startMinutes;
  if (shiftDuration < 0) shiftDuration += 24 * 60; // Handle overnight shifts

  // Define breaks and meetings
  const break1Start = startMinutes + 90; // 1.5 hours after start
  const lunchStart = startMinutes + 240; // 4 hours after start
  const break2Start = startMinutes + 420; // 7 hours after start

  const meetingTypes = ['Calibration call', 'Misses call', 'Status call'];
  const getMeetingType = (index: number) => {
    const hash = (employee.id + index).split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return meetingTypes[hash % meetingTypes.length];
  };

  const meeting1Start = startMinutes + 210; // 3.5 hours after start
  const meeting2Start = startMinutes + 510; // 8.5 hours after start

  const formatMinutesToTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const getTopPosition = (minutes: number) => {
    const relativeMinutes = minutes - startMinutes;
    return (relativeMinutes / shiftDuration) * 100;
  };

  const getHeight = (durationMinutes: number) => {
    return (durationMinutes / shiftDuration) * 100;
  };

  // Generate time labels
  const timeLabels = [];
  for (let i = 0; i <= 9; i++) {
    const minutes = startMinutes + (shiftDuration / 9) * i;
    timeLabels.push({
      time: formatMinutesToTime(minutes),
      position: (i / 9) * 100
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="w-4 h-4" />
        <span>Timeline view for {date ? new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'selected date'}</span>
      </div>

      <div className="relative bg-muted/30 rounded-xl p-6 min-h-[600px]">
        {/* Time labels */}
        <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between py-6">
          {timeLabels.map((label, index) => (
            <div key={index} className="text-xs text-muted-foreground text-right pr-3">
              {label.time}
            </div>
          ))}
        </div>

        {/* Timeline area */}
        <div className="ml-16 relative h-full min-h-[550px]">
          {/* Grid lines */}
          {timeLabels.map((label, index) => (
            <div
              key={index}
              className="absolute left-0 right-0 border-t border-border"
              style={{ top: `${label.position}%` }}
            />
          ))}

          {/* Current time indicator */}
          <div
            className="absolute left-0 right-0 h-0.5 bg-red-500 z-10"
            style={{ top: '30%' }}
          >
            <div className="absolute -left-2 -top-1 w-4 h-4 bg-red-500 rounded-full border-2 border-background" />
            <div className="absolute left-4 -top-3 text-xs text-red-500 font-medium bg-background px-2 py-1 rounded">
              Now
            </div>
          </div>

          {/* Login marker */}
          <div
            className="absolute left-0 right-0 flex items-center gap-2"
            style={{ top: '0%' }}
          >
            <div className="w-full h-8 bg-green-500/20 border-l-4 border-green-500 rounded flex items-center px-3">
              <span className="text-sm font-medium text-green-700">Login • {shift.startTime}</span>
            </div>
          </div>

          {/* Break 1 */}
          <div
            className="absolute left-0 right-0"
            style={{ top: `${getTopPosition(break1Start)}%`, height: `${getHeight(15)}%` }}
          >
            <div className="w-full h-full bg-orange-500/20 border-l-4 border-orange-500 rounded flex items-center px-3">
              <span className="text-sm font-medium text-orange-700">Break • 15 min</span>
            </div>
          </div>

          {/* Lunch break */}
          <div
            className="absolute left-0 right-0"
            style={{ top: `${getTopPosition(lunchStart)}%`, height: `${getHeight(30)}%` }}
          >
            <div className="w-full h-full bg-blue-500/20 border-l-4 border-blue-500 rounded flex items-center px-3">
              <span className="text-sm font-medium text-blue-700">Lunch Break • 30 min</span>
            </div>
          </div>

          {/* Meeting 1 */}
          <div
            className="absolute left-0 right-0"
            style={{ top: `${getTopPosition(meeting1Start)}%`, height: `${getHeight(15)}%` }}
          >
            <div className="w-full h-full bg-purple-500/20 border-l-4 border-purple-500 rounded flex items-center px-3">
              <span className="text-sm font-medium text-purple-700">{getMeetingType(0)} • 10:00</span>
            </div>
          </div>

          {/* Break 2 */}
          <div
            className="absolute left-0 right-0"
            style={{ top: `${getTopPosition(break2Start)}%`, height: `${getHeight(15)}%` }}
          >
            <div className="w-full h-full bg-orange-500/20 border-l-4 border-orange-500 rounded flex items-center px-3">
              <span className="text-sm font-medium text-orange-700">Break • 15 min</span>
            </div>
          </div>

          {/* Meeting 2 */}
          <div
            className="absolute left-0 right-0"
            style={{ top: `${getTopPosition(meeting2Start)}%`, height: `${getHeight(30)}%` }}
          >
            <div className="w-full h-full bg-purple-500/20 border-l-4 border-purple-500 rounded flex items-center px-3">
              <span className="text-sm font-medium text-purple-700">{getMeetingType(1)} • 14:30</span>
            </div>
          </div>

          {/* Logout marker */}
          <div
            className="absolute left-0 right-0 flex items-center gap-2"
            style={{ top: '100%', marginTop: '-32px' }}
          >
            <div className="w-full h-8 bg-red-500/20 border-l-4 border-red-500 rounded flex items-center px-3">
              <span className="text-sm font-medium text-red-700">Logout • {shift.endTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded" />
          <span className="text-muted-foreground">Login/Logout</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-500 rounded" />
          <span className="text-muted-foreground">Breaks</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded" />
          <span className="text-muted-foreground">Lunch</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-500 rounded" />
          <span className="text-muted-foreground">Meetings</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded" />
          <span className="text-muted-foreground">Current Time</span>
        </div>
      </div>
    </div>
  );
}
