import { useState } from 'react';
import { Search, Plus, Pencil, Trash2, Mail, Phone, Users } from 'lucide-react';
import { useRosterStore } from '../store/rosterStore';
import { EmployeeFormDialog } from '../components/employee/EmployeeFormDialog';
import { DeleteConfirmDialog } from '../components/employee/DeleteConfirmDialog';
import { Employee } from '../types/employee';

export function EmployeesPage() {
  const { employees } = useRosterStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [formDialog, setFormDialog] = useState<{ isOpen: boolean; employee: Employee | null }>({
    isOpen: false,
    employee: null
  });
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    employeeId: string;
    employeeName: string;
  } | null>(null);

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddEmployee = () => {
    setFormDialog({ isOpen: true, employee: null });
  };

  const handleEditEmployee = (employee: Employee) => {
    setFormDialog({ isOpen: true, employee });
  };

  const handleDeleteEmployee = (employeeId: string, employeeName: string) => {
    setDeleteDialog({ isOpen: true, employeeId, employeeName });
  };

  const closeFormDialog = () => {
    setFormDialog({ isOpen: false, employee: null });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog(null);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="mb-2">Employee Directory</h1>
        <p className="text-muted-foreground">Manage employee records, contact information, and shift assignments</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or ID..."
            className="pl-10 pr-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring w-full"
          />
        </div>
        <button
          onClick={handleAddEmployee}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors ml-4"
        >
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
        <table className="w-full">
          <thead>
            <tr className="bg-muted border-b border-border">
              <th className="text-left p-4 font-medium">Employee ID</th>
              <th className="text-left p-4 font-medium">Name</th>
              <th className="text-left p-4 font-medium">Department</th>
              <th className="text-left p-4 font-medium">Shift</th>
              <th className="text-left p-4 font-medium">Contact</th>
              <th className="text-left p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No employees found matching your search' : 'No employees added yet. Click "Add Employee" to get started.'}
                  </p>
                </td>
              </tr>
            ) : (
              filteredEmployees.map((employee) => (
                <tr key={employee.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="p-4">
                  <span className="font-medium text-sm">{employee.id}</span>
                </td>
                <td className="p-4">
                  <div className="font-medium">{employee.name}</div>
                  <div className="text-sm text-muted-foreground">{employee.role}</div>
                </td>
                <td className="p-4 text-sm">{employee.department}</td>
                <td className="p-4">
                  <span className={`inline-block px-2 py-1 rounded text-xs ${
                    employee.assignedShift === null ? 'bg-gray-500/10 text-gray-600' :
                    employee.assignedShift === 'shift1' ? 'bg-blue-500/10 text-blue-600' :
                    employee.assignedShift === 'shift2' ? 'bg-orange-500/10 text-orange-600' :
                    'bg-purple-500/10 text-purple-600'
                  }`}>
                    {employee.assignedShift === null ? 'Available' :
                     employee.assignedShift === 'shift1' ? 'Shift 1' :
                     employee.assignedShift === 'shift2' ? 'Shift 2' : 'Shift 3'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{employee.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{employee.phone}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditEmployee(employee)}
                      className="p-2 hover:bg-secondary rounded-md transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteEmployee(employee.id, employee.name)}
                      className="p-2 hover:bg-destructive/10 text-destructive rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-between items-center text-sm text-muted-foreground">
        <span>Showing {filteredEmployees.length} of {employees.length} employees</span>
        <div className="flex gap-2">
          <button className="px-3 py-1 border border-border rounded hover:bg-secondary transition-colors">
            Previous
          </button>
          <button className="px-3 py-1 border border-border rounded hover:bg-secondary transition-colors">
            Next
          </button>
        </div>
      </div>

      <EmployeeFormDialog
        isOpen={formDialog.isOpen}
        onClose={closeFormDialog}
        employee={formDialog.employee}
      />

      {deleteDialog && (
        <DeleteConfirmDialog
          isOpen={deleteDialog.isOpen}
          onClose={closeDeleteDialog}
          employeeId={deleteDialog.employeeId}
          employeeName={deleteDialog.employeeName}
        />
      )}
    </div>
  );
}
