import { useState } from 'react';
import { Clock, Coffee, CheckSquare, ArrowRightLeft, Plus, X, Pencil, Check } from 'lucide-react';
import { Assignment, TASK_QUEUES, TaskQueue } from '../../types/assignment';
import { Employee } from '../../types/employee';
import { SHIFTS } from '../../types/shift';
import { useRosterStore } from '../../store/rosterStore';
import { SwapDialog } from './SwapDialog';

type WorkdayTabProps = {
  assignment: Assignment | null;
  employee: Employee;
  date: string | null;
};

type BreakTime = {
  name: string;
  start: string;
  end: string;
};

const DEFAULT_BREAKS: BreakTime[] = [
  { name: 'Break 1', start: '10:30', end: '10:45' },
  { name: 'Lunch Break', start: '13:00', end: '13:30' },
  { name: 'Break 2', start: '16:00', end: '16:15' },
];

export function WorkdayTab({ assignment, employee, date }: WorkdayTabProps) {
  const [isSwapDialogOpen, setIsSwapDialogOpen] = useState(false);
  const [isTaskMenuOpen, setIsTaskMenuOpen] = useState(false);
  const [isEditingBreaks, setIsEditingBreaks] = useState(false);
  const [breaks, setBreaks] = useState<BreakTime[]>(DEFAULT_BREAKS);
  const [draftBreaks, setDraftBreaks] = useState<BreakTime[]>(DEFAULT_BREAKS);
  const addAssignmentTask = useRosterStore((state) => state.addAssignmentTask);
  const removeAssignmentTask = useRosterStore((state) => state.removeAssignmentTask);

  if (!assignment || assignment.status === 'off' || assignment.status === 'absent') {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>{assignment?.status === 'absent' ? 'Employee is on full day leave' : 'Employee is off this day'}</p>
      </div>
    );
  }

  const shift = assignment.shiftType ? SHIFTS[assignment.shiftType] : null;
  const assignedQueues = assignment.taskQueues ?? [];

  const addQueue = (queue: TaskQueue) => {
    if (assignedQueues.includes(queue)) return;
    addAssignmentTask(assignment.employeeId, assignment.date, queue);
    setIsTaskMenuOpen(false);
  };

  const removeQueue = (queue: TaskQueue) => {
    removeAssignmentTask(assignment.employeeId, assignment.date, queue);
  };

  const updateBreakTime = (index: number, field: 'start' | 'end', value: string) => {
    setDraftBreaks((currentBreaks) => currentBreaks.map((breakTime, breakIndex) =>
      breakIndex === index ? { ...breakTime, [field]: value } : breakTime,
    ));
  };

  const saveBreaks = () => {
    setBreaks(draftBreaks);
    setIsEditingBreaks(false);
  };

  const cancelBreakEditing = () => {
    setDraftBreaks(breaks);
    setIsEditingBreaks(false);
  };

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
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2">
            <Coffee className="w-5 h-5" />
            Breaks
          </h3>
          {isEditingBreaks ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={saveBreaks}
                className="rounded-md p-2 text-primary hover:bg-primary/10"
                aria-label="Save break times"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={cancelBreakEditing}
                className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
                aria-label="Cancel editing break times"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setDraftBreaks(breaks);
                setIsEditingBreaks(true);
              }}
              className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
              aria-label="Edit break times"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="space-y-2">
          {(isEditingBreaks ? draftBreaks : breaks).map((breakTime, index) => (
            <div key={breakTime.name} className="flex items-center justify-between gap-3 rounded-lg bg-background p-3">
              <span className="font-medium">{breakTime.name}</span>
              {isEditingBreaks ? (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={breakTime.start}
                    onChange={(event) => updateBreakTime(index, 'start', event.target.value)}
                    className="rounded-md border border-border bg-card px-2 py-1 text-sm"
                    aria-label={`${breakTime.name} start time`}
                  />
                  <span className="text-muted-foreground">to</span>
                  <input
                    type="time"
                    value={breakTime.end}
                    onChange={(event) => updateBreakTime(index, 'end', event.target.value)}
                    className="rounded-md border border-border bg-card px-2 py-1 text-sm"
                    aria-label={`${breakTime.name} end time`}
                  />
                </div>
              ) : (
                <span className="text-muted-foreground">{breakTime.start} – {breakTime.end}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-muted/50 rounded-xl p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5" />
            Tasks
          </h3>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsTaskMenuOpen((isOpen) => !isOpen)}
              className="flex h-9 min-w-10 items-center justify-center gap-1 rounded-md border border-primary bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              aria-expanded={isTaskMenuOpen}
            >
              <Plus className="w-4 h-4" />
              Add task
            </button>
            {isTaskMenuOpen && (
              <div className="absolute right-0 z-10 mt-2 w-44 rounded-lg border border-border bg-card p-1 shadow-lg">
                {TASK_QUEUES.map((queue) => (
                  <button
                    key={queue}
                    type="button"
                    onClick={() => addQueue(queue)}
                    disabled={assignedQueues.includes(queue)}
                    className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {queue}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="space-y-2">
          {assignedQueues.length === 0 ? (
            <p className="rounded-lg bg-background p-3 text-sm text-muted-foreground">No tasks assigned for this day.</p>
          ) : assignedQueues.map((queue) => (
            <div key={queue} className="flex items-center justify-between gap-3 rounded-lg bg-background p-3">
              <span className="font-medium">{queue}</span>
              <button
                type="button"
                onClick={() => removeQueue(queue)}
                className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                aria-label={`Remove ${queue}`}
              >
                <X className="w-4 h-4" />
              </button>
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
