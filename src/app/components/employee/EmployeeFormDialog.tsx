import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useRosterStore } from '../../store/rosterStore';
import { Employee } from '../../types/employee';
import { toast } from 'sonner';

type EmployeeFormDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  employee?: Employee | null;
};

export function EmployeeFormDialog({ isOpen, onClose, employee }: EmployeeFormDialogProps) {
  const { addEmployee, updateEmployee } = useRosterStore();
  const isEditMode = !!employee;

  const [formData, setFormData] = useState({
    name: '',
    role: 'Staff',
    email: '',
    phone: '',
    department: 'Operations',
    assignedShift: 'shift1' as 'shift1' | 'shift2' | 'shift3' | ''
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        role: employee.role,
        email: employee.email,
        phone: employee.phone,
        department: employee.department,
        assignedShift: employee.assignedShift || ''
      });
    } else {
      setFormData({
        name: '',
        role: 'Staff',
        email: '',
        phone: '',
        department: 'Operations',
        assignedShift: 'shift1'
      });
    }
  }, [employee, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    const employeeData = {
      ...formData,
      assignedShift: (formData.assignedShift === '' ? null : formData.assignedShift) as 'shift1' | 'shift2' | 'shift3' | null
    };

    if (isEditMode && employee) {
      updateEmployee(employee.id, employeeData);
      toast.success('Employee updated successfully');
    } else {
      addEmployee(employeeData);
      toast.success('Employee added successfully');
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3>{isEditMode ? 'Edit Employee' : 'Add New Employee'}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter employee name"
                className="w-full p-3 border border-border rounded-lg bg-background"
                required
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Role
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="Enter role"
                className="w-full p-3 border border-border rounded-lg bg-background"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Email <span className="text-destructive">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="employee@company.com"
                className="w-full p-3 border border-border rounded-lg bg-background"
                required
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Phone <span className="text-destructive">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 00000"
                className="w-full p-3 border border-border rounded-lg bg-background"
                required
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Department
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full p-3 border border-border rounded-lg bg-background"
              >
                <option value="Operations">Operations</option>
                <option value="Sales">Sales</option>
                <option value="Support">Support</option>
                <option value="Engineering">Engineering</option>
                <option value="HR">HR</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Assigned Shift
              </label>
              <select
                value={formData.assignedShift}
                onChange={(e) => setFormData({ ...formData, assignedShift: e.target.value as 'shift1' | 'shift2' | 'shift3' | '' })}
                className="w-full p-3 border border-border rounded-lg bg-background"
              >
                <option value="">Idle (No Shift)</option>
                <option value="shift1">Shift 1 (6:30 AM - 3:30 PM)</option>
                <option value="shift2">Shift 2 (3:30 PM - 12:30 AM)</option>
                <option value="shift3">Shift 3 (9:30 PM - 6:30 AM)</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors"
            >
              {isEditMode ? 'Update' : 'Add'} Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
