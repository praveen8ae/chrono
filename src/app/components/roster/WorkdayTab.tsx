import { useState } from 'react';
import { Clock, Coffee, Users as UsersIcon, CheckSquare, ArrowRightLeft } from 'lucide-react';
import { Assignment } from '../../types/assignment';
import { Employee } from '../../types/employee';
import { SHIFTS } from '../../types/shift';
import { SwapDialog } from './SwapDialog';

type WorkdayTabProps = {
  assignment: Assignment | null;
  employee: Employee;
  date: string | null;
};

export function WorkdayTab({ assignment, employee, date }: WorkdayTabProps) {
  const [isSwapDialogOpen, setIsSwapDialogOpen] = useState(false);

  if (!assignment || assignment.status === 'off' || assignment.status === 'absent') {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>{assignment?.status === 'absent' ? 'Employee is on full day leave' : 'Employee is off this day'}</p>
      </div>
    );
  }

  const shift = assignment.shiftType ? SHIFTS[assignment.shiftType] : null;

  // Randomize meeting types
  const meetingTypes = ['Calibration call', 'Misses call', 'Status call'];
  const getMeetingType = (index: number) => {
    const hash = (employee.id + index).split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return meetingTypes[hash % meetingTypes.length];
  };

  const mockMeetings = [
    { time: '10:00', title: getMeetingType(0), duration: '15 min' },
    { time: '14:30', title: getMeetingType(1), duration: '30 min' }
  ];

  // Determine tasks based on employee
  const hash = employee.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const hasMissesCall = hash % 3 === 0; // ~33% of employees
  const hasLSCleanup = hash % 7 === 0; // ~14% of employees

  const mockTasks = [
    { title: 'Order review', priority: 'high' as const, forEveryone: true },
    ...(hasMissesCall ? [{ title: 'Misses call', priority: 'medium' as const, forEveryone: false }] : []),
    ...(hasLSCleanup ? [{ title: 'LS cleanup', priority: 'low' as const, forEveryone: false }] : [])
  ];

  return (
    <div className="space-y-6">
      <div className="bg-muted/50 rounded-xl p-4">
        <h3 className="mb-3 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Shift Details
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Assigned Shift</p>
            <p className="font-medium mt-1">{shift?.name || 'Not assigned'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Time</p>
            <p className="font-medium mt-1">
              {shift?.startTime && shift?.endTime ? `${shift.startTime} – ${shift.endTime}` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Login Time</p>
            <p className="font-medium mt-1">{shift?.startTime || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Logout Time</p>
            <p className="font-medium mt-1">{shift?.endTime || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="bg-muted/50 rounded-xl p-4">
        <h3 className="mb-3 flex items-center gap-2">
          <Coffee className="w-5 h-5" />
          Breaks
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center p-3 bg-background rounded-lg">
            <span>Break 1</span>
            <span className="text-muted-foreground">15 minutes</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-background rounded-lg">
            <span>Lunch Break</span>
            <span className="text-muted-foreground">30 minutes</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-background rounded-lg">
            <span>Break 2</span>
            <span className="text-muted-foreground">15 minutes</span>
          </div>
        </div>
      </div>

      <div className="bg-muted/50 rounded-xl p-4">
        <h3 className="mb-3 flex items-center gap-2">
          <UsersIcon className="w-5 h-5" />
          Meetings
        </h3>
        <div className="space-y-2">
          {mockMeetings.map((meeting, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-background rounded-lg">
              <div>
                <p className="font-medium">{meeting.title}</p>
                <p className="text-sm text-muted-foreground">{meeting.duration}</p>
              </div>
              <span className="text-muted-foreground">{meeting.time}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-muted/50 rounded-xl p-4">
        <h3 className="mb-3 flex items-center gap-2">
          <CheckSquare className="w-5 h-5" />
          Tasks
        </h3>
        <div className="space-y-2">
          {mockTasks.map((task, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-background rounded-lg">
              <input type="checkbox" className="w-4 h-4 rounded border-border" />
              <span className="flex-1">{task.title}</span>
              <span
                className={`px-2 py-1 rounded text-xs ${
                  task.priority === 'high'
                    ? 'bg-red-500/10 text-red-600'
                    : task.priority === 'medium'
                    ? 'bg-yellow-500/10 text-yellow-600'
                    : 'bg-blue-500/10 text-blue-600'
                }`}
              >
                {task.priority}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => setIsSwapDialogOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
      >
        <ArrowRightLeft className="w-4 h-4" />
        Swap Shift
      </button>

      {date && (
        <SwapDialog
          isOpen={isSwapDialogOpen}
          onClose={() => setIsSwapDialogOpen(false)}
          currentEmployee={employee}
          currentDate={date}
          currentAssignment={assignment}
        />
      )}
    </div>
  );
}
