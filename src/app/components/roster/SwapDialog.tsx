import { useState } from 'react';
import { X, Calendar, ArrowRightLeft, User } from 'lucide-react';
import { useRosterStore } from '../../store/rosterStore';
import { Employee } from '../../types/employee';
import { Assignment } from '../../types/assignment';
import { toast } from 'sonner';
import { format } from 'date-fns';

type SwapDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  currentEmployee: Employee;
  currentDate: string;
  currentAssignment: Assignment;
};

export function SwapDialog({
  isOpen,
  onClose,
  currentEmployee,
  currentDate,
  currentAssignment
}: SwapDialogProps) {
  const { employees, assignments, addSwap } = useRosterStore();
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedSwapDate, setSelectedSwapDate] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setSelectedEmployee(null);
    setSelectedSwapDate(null);
    onClose();
  };

  // Get employees in the same shift
  const sameShiftEmployees = employees.filter(
    e => e.assignedShift === currentEmployee.assignedShift && e.id !== currentEmployee.id
  );

  // Get off days for selected employee
  const getOffDaysForEmployee = (employeeId: string) => {
    return assignments
      .filter(a => a.employeeId === employeeId && a.status === 'off')
      .slice(0, 10); // Show up to 10 off days
  };

  const handleSwap = () => {
    if (!selectedEmployee || !selectedSwapDate) {
      toast.error('Please select an employee and date to swap');
      return;
    }

    const selectedEmp = employees.find(e => e.id === selectedEmployee);
    if (!selectedEmp) return;

    addSwap({
      employee1Id: currentEmployee.id,
      employee1Name: currentEmployee.name,
      employee1Date: currentDate,
      employee2Id: selectedEmployee,
      employee2Name: selectedEmp.name,
      employee2Date: selectedSwapDate
    });

    toast.success(
      `Swapped ${currentEmployee.name}'s work day (${format(new Date(currentDate), 'MMM d')}) with ${selectedEmp.name}'s off day (${format(new Date(selectedSwapDate), 'MMM d')})`
    );

    handleClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-primary" />
            <h3>Swap Shift</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <User className="w-5 h-5 text-primary" />
            <p className="font-medium">Swapping for:</p>
          </div>
          <p className="text-sm text-muted-foreground">
            {currentEmployee.name} ({currentEmployee.id}) - {currentEmployee.assignedShift === 'shift1' ? 'Shift 1' : currentEmployee.assignedShift === 'shift2' ? 'Shift 2' : 'Shift 3'}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Calendar className="w-4 h-4 text-primary" />
            <p className="text-sm font-medium">
              Work Day: {format(new Date(currentDate), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-3">
            Select an employee from the same shift ({currentEmployee.assignedShift === 'shift1' ? 'Shift 1' : currentEmployee.assignedShift === 'shift2' ? 'Shift 2' : 'Shift 3'}):
          </p>

          {sameShiftEmployees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No other employees in this shift</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sameShiftEmployees.map((employee) => (
                <button
                  key={employee.id}
                  onClick={() => {
                    setSelectedEmployee(employee.id);
                    setSelectedSwapDate(null);
                  }}
                  className={`w-full p-4 border rounded-lg text-left transition-all ${
                    selectedEmployee === employee.id
                      ? 'border-primary bg-primary/10 border-2'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-sm text-muted-foreground">{employee.id}</p>
                    </div>
                    {selectedEmployee === employee.id && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                        Selected
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedEmployee && (
          <div className="mb-6 p-4 border border-border rounded-lg">
            <p className="text-sm text-muted-foreground mb-3">
              Select an off day from {employees.find(e => e.id === selectedEmployee)?.name}:
            </p>

            {getOffDaysForEmployee(selectedEmployee).length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <p>No off days available for this employee</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {getOffDaysForEmployee(selectedEmployee).map((assignment) => (
                  <button
                    key={assignment.id}
                    onClick={() => setSelectedSwapDate(assignment.date)}
                    className={`p-3 border rounded-lg text-left transition-all ${
                      selectedSwapDate === assignment.date
                        ? 'border-primary bg-primary/10 border-2'
                        : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    <p className="text-sm font-medium">
                      {format(new Date(assignment.date), 'MMM d, yyyy')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(assignment.date), 'EEEE')}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedEmployee && selectedSwapDate && (
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm font-medium mb-2">Swap Summary:</p>
            <div className="flex items-center gap-3 text-sm">
              <span>
                {currentEmployee.name} ({format(new Date(currentDate), 'MMM d')})
              </span>
              <ArrowRightLeft className="w-4 h-4" />
              <span>
                {employees.find(e => e.id === selectedEmployee)?.name} ({format(new Date(selectedSwapDate), 'MMM d')})
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSwap}
            disabled={!selectedEmployee || !selectedSwapDate}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
              selectedEmployee && selectedSwapDate
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            Confirm Swap
          </button>
        </div>
      </div>
    </div>
  );
}
