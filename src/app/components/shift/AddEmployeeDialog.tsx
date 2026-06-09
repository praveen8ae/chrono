import { useState } from 'react';
import { X, Search, UserPlus } from 'lucide-react';
import { useRosterStore } from '../../store/rosterStore';

type AddEmployeeDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  shiftId: 'shift1' | 'shift2' | 'shift3';
  shiftName: string;
};

export function AddEmployeeDialog({
  isOpen,
  onClose,
  shiftId,
  shiftName
}: AddEmployeeDialogProps) {
  const { employees, updateEmployee } = useRosterStore();
  const [searchQuery, setSearchQuery] = useState('');

  const availableEmployees = employees.filter(e => e.assignedShift !== shiftId);
  const filteredEmployees = availableEmployees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToShift = (employeeId: string) => {
    updateEmployee(employeeId, { assignedShift: shiftId });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Add Employee to {shiftName}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Select an employee to add to this shift
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 border-b border-border">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or ID..."
              className="pl-10 pr-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring w-full"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No employees found matching your search' : 'All employees are already in this shift'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{employee.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {employee.id} • {employee.department} • {
                        employee.assignedShift === null ? 'Available (No shift)' :
                        employee.assignedShift === 'shift1' ? 'Currently in Shift 1' :
                        employee.assignedShift === 'shift2' ? 'Currently in Shift 2' :
                        'Currently in Shift 3'
                      }
                    </p>
                  </div>
                  <button
                    onClick={() => handleAddToShift(employee.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
