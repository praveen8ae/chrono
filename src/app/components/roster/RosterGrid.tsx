import { useEffect, useState } from 'react';
import { useRosterStore } from '../../store/rosterStore';
import { useAuthStore } from '../../store/authStore';
import { RosterCell } from './RosterCell';
import { AddEmployeeDialog } from '../shift/AddEmployeeDialog';
import { SHIFTS } from '../../types/shift';
import { Sun, Sunset, Moon, Pencil, Plus, Minus, Undo2, Redo2 } from 'lucide-react';

export function RosterGrid() {
  const { currentMonth, assignments, loadAssignments, openModal, employees, updateAssignment, updateEmployee, undo, redo, canUndo, canRedo } = useRosterStore();
  const { user } = useAuthStore();
  const [editMode, setEditMode] = useState<'shift1' | 'shift2' | 'shift3' | null>(null);
  const [addEmployeeDialog, setAddEmployeeDialog] = useState<{
    isOpen: boolean;
    shiftId: 'shift1' | 'shift2' | 'shift3';
    shiftName: string;
  } | null>(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    loadAssignments(year, month);
  }, [currentMonth, loadAssignments]);

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysCount = new Date(year, month + 1, 0).getDate();
    const days = [];

    for (let day = 1; day <= daysCount; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        dayNum: day,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dateStr: date.toISOString().split('T')[0]
      });
    }

    return days;
  };

  const days = getDaysInMonth();

  const getAssignment = (employeeId: string, dateStr: string) => {
    return assignments.find(a => a.employeeId === employeeId && a.date === dateStr) || null;
  };

  const handleCellClick = (employeeId: string, dateStr: string, shiftId: 'shift1' | 'shift2' | 'shift3') => {
    if (editMode === shiftId && isAdmin) {
      return;
    }
    const assignment = getAssignment(employeeId, dateStr);
    openModal(employeeId, dateStr, assignment);
  };

  const toggleEditMode = (shiftId: 'shift1' | 'shift2' | 'shift3') => {
    if (!isAdmin) return;
    setEditMode(editMode === shiftId ? null : shiftId);
  };

  const handleAddEmployee = (shiftId: 'shift1' | 'shift2' | 'shift3', shiftName: string) => {
    setAddEmployeeDialog({
      isOpen: true,
      shiftId,
      shiftName
    });
  };

  const handleRemoveEmployee = (employeeId: string, currentShift: 'shift1' | 'shift2' | 'shift3') => {
    // Set to null to make employee idle/available
    updateEmployee(employeeId, { assignedShift: null });
  };

  // Group employees by shift
  const shift1Employees = employees.filter(e => e.assignedShift === 'shift1');
  const shift2Employees = employees.filter(e => e.assignedShift === 'shift2');
  const shift3Employees = employees.filter(e => e.assignedShift === 'shift3');

  const shiftGroups = [
    {
      shift: 'shift1',
      name: SHIFTS.shift1.name,
      timing: '6:30 AM - 3:30 PM IST',
      icon: Sun,
      employees: shift1Employees,
      bgColor: 'bg-blue-500/10',
      dotColor: 'bg-blue-500',
      iconColor: 'text-blue-600'
    },
    {
      shift: 'shift2',
      name: SHIFTS.shift2.name,
      timing: '3:30 PM - 12:30 AM IST',
      icon: Sunset,
      employees: shift2Employees,
      bgColor: 'bg-orange-500/10',
      dotColor: 'bg-orange-500',
      iconColor: 'text-orange-600'
    },
    {
      shift: 'shift3',
      name: SHIFTS.shift3.name,
      timing: '12:30 AM - 6:30 AM IST',
      icon: Moon,
      employees: shift3Employees,
      bgColor: 'bg-purple-500/10',
      dotColor: 'bg-purple-500',
      iconColor: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-6 relative" id="roster-grid-container">
      {editMode && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <h3 className="font-medium mb-2">Edit Mode Guide</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-green-500/20 text-green-600 rounded">P</kbd>
              <span>Present</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-muted rounded">-</kbd>
              <span>Off Day</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-blue-500/20 text-blue-600 rounded">L</kbd>
              <span>Leave</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-yellow-500/20 text-yellow-600 rounded">H</kbd>
              <span>Half Day</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-red-500/20 text-red-600 rounded">A</kbd>
              <span>Absent</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Click on any cell to quickly assign a status</p>
        </div>
      )}

      {shiftGroups.map((group) => {
        const Icon = group.icon;
        return (
        <div key={group.shift} className="bg-card border border-border rounded-3xl overflow-hidden shadow-lg p-2">
          {/* Fixed Shift Header */}
          <div className={`${group.bgColor} border-b border-border p-5 ${editMode === group.shift ? 'ring-2 ring-primary' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Icon className={`w-6 h-6 ${group.iconColor}`} />
                <div className="flex flex-col">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-lg">{group.name}</span>
                    <span className="text-sm text-muted-foreground">
                      ({group.employees.length} employees)
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground mt-0.5">
                    {group.timing}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {editMode === group.shift && (
                  <>
                    <div className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-lg">
                      Edit Mode Active
                    </div>
                    <div className="flex items-center gap-1 border border-border rounded-lg">
                      <button
                        onClick={undo}
                        disabled={!canUndo()}
                        className={`p-2 hover:bg-secondary rounded-l-lg transition-colors ${
                          !canUndo() ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        title="Undo"
                      >
                        <Undo2 className="w-4 h-4" />
                      </button>
                      <div className="w-px h-6 bg-border" />
                      <button
                        onClick={redo}
                        disabled={!canRedo()}
                        className={`p-2 hover:bg-secondary rounded-r-lg transition-colors ${
                          !canRedo() ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        title="Redo"
                      >
                        <Redo2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
                <button
                  onClick={() => toggleEditMode(group.shift as 'shift1' | 'shift2' | 'shift3')}
                  className={`p-2 rounded-lg transition-colors ${
                    editMode === group.shift
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-secondary/80'
                  }`}
                  title={editMode === group.shift ? 'Exit edit mode' : 'Enable edit mode'}
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Scrollable Table */}
          <div className="overflow-x-auto scrollbar-thin">
            <div className="min-w-full inline-block">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 bg-muted border-b border-r border-border p-5 text-left w-[220px]">
                      <span className="font-medium text-sm">Employee</span>
                    </th>
                    {days.map((day) => (
                      <th
                        key={day.dateStr}
                        className={`border-b border-r border-border p-3 text-center w-[60px] ${
                          day.date.getDay() === 0 || day.date.getDay() === 6 ? 'bg-muted/50' : 'bg-muted'
                        }`}
                      >
                        <div className="text-[10px] text-muted-foreground mb-1">{day.dayName}</div>
                        <div className="text-sm font-medium">{day.dayNum}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {group.employees.length === 0 && !editMode && (
                    <tr>
                      <td colSpan={days.length + 1} className="p-12 text-center">
                        <p className="text-muted-foreground">No employees in this shift. Click the pencil icon to add employees.</p>
                      </td>
                    </tr>
                  )}
                  {group.employees.map((employee) => (
                    <tr key={employee.id} className="group/row">
                      <td className="sticky left-0 z-10 bg-card border-b border-r border-border p-4 w-[220px]">
                        <div className="flex items-center gap-3">
                          {editMode === group.shift && (
                            <button
                              onClick={() => handleRemoveEmployee(employee.id, group.shift as 'shift1' | 'shift2' | 'shift3')}
                              className="p-1 hover:bg-destructive/10 text-destructive rounded transition-colors opacity-0 group-hover/row:opacity-100"
                              title="Remove from shift"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{employee.name}</div>
                            <div className="text-[10px] text-muted-foreground truncate mt-1.5">{employee.id}</div>
                          </div>
                        </div>
                      </td>
                      {days.map((day) => {
                        const assignment = getAssignment(employee.id, day.dateStr);
                        return (
                          <td
                            key={`${employee.id}-${day.dateStr}`}
                            className={`border-b border-r border-border px-0.5 w-[60px] h-[60px] ${
                              day.date.getDay() === 0 || day.date.getDay() === 6 ? 'bg-muted/30' : ''
                            }`}
                          >
                            <RosterCell
                              assignment={assignment}
                              onClick={() => handleCellClick(employee.id, day.dateStr, group.shift as 'shift1' | 'shift2' | 'shift3')}
                              employeeId={employee.id}
                              date={day.dateStr}
                              isEditMode={editMode === group.shift}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {editMode === group.shift && (
                    <tr>
                      <td className="sticky left-0 z-10 bg-card border-b border-r border-border p-4 w-[220px]">
                        <button
                          onClick={() => handleAddEmployee(group.shift as 'shift1' | 'shift2' | 'shift3', group.name)}
                          className="w-full flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors border border-dashed border-border"
                        >
                          <Plus className="w-4 h-4" />
                          Add Employee
                        </button>
                      </td>
                      {days.map((day) => (
                        <td
                          key={`add-${day.dateStr}`}
                          className={`border-b border-r border-border ${
                            day.date.getDay() === 0 || day.date.getDay() === 6 ? 'bg-muted/30' : ''
                          }`}
                        />
                      ))}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        );
      })}

      {addEmployeeDialog && (
        <AddEmployeeDialog
          isOpen={addEmployeeDialog.isOpen}
          onClose={() => setAddEmployeeDialog(null)}
          shiftId={addEmployeeDialog.shiftId}
          shiftName={addEmployeeDialog.shiftName}
        />
      )}
    </div>
  );
}
