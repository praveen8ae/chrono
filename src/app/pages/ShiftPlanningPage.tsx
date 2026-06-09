import { useState } from 'react';
import { Plus, Settings, Copy, RefreshCw } from 'lucide-react';
import { useRosterStore } from '../store/rosterStore';
import { ShiftChangeDialog } from '../components/shift/ShiftChangeDialog';
import { RecentShiftChanges } from '../components/shift/RecentShiftChanges';

export function ShiftPlanningPage() {
  const { employees } = useRosterStore();
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    employeeId: string;
    employeeName: string;
    currentShift: 'shift1' | 'shift2' | 'shift3';
  } | null>(null);

  const handleOpenDialog = (employeeId: string, employeeName: string, currentShift: 'shift1' | 'shift2' | 'shift3') => {
    setDialogState({ isOpen: true, employeeId, employeeName, currentShift });
  };

  const handleCloseDialog = () => {
    setDialogState(null);
  };
  const shiftTemplates = [
    {
      id: '1',
      name: 'Standard 5-Day Week',
      description: '5 working days, 2 days off',
      shifts: 'Shift 1: 6:30 AM - 3:30 PM'
    },
    {
      id: '2',
      name: 'Weekend Coverage',
      description: 'Includes weekend shifts',
      shifts: 'Rotating shifts including Sat-Sun'
    },
    {
      id: '3',
      name: '24/7 Coverage',
      description: 'Full week rotation',
      shifts: 'All three shifts, 6 days working'
    }
  ];

  const shift1Count = employees.filter(e => e.assignedShift === 'shift1').length;
  const shift2Count = employees.filter(e => e.assignedShift === 'shift2').length;
  const shift3Count = employees.filter(e => e.assignedShift === 'shift3').length;

  const shiftStats = [
    { shift: 'Shift 1', employees: shift1Count, coverage: '100%', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20', textColor: 'text-blue-600' },
    { shift: 'Shift 2', employees: shift2Count, coverage: '100%', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/20', textColor: 'text-orange-600' },
    { shift: 'Shift 3', employees: shift3Count, coverage: '100%', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/20', textColor: 'text-purple-600' }
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="mb-2">Shift Planning & Scheduling</h1>
        <p className="text-muted-foreground">Configure shift templates, manage schedules, and optimize workforce coverage</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {shiftStats.map((stat) => (
          <div key={stat.shift} className={`${stat.bgColor} border ${stat.borderColor} rounded-2xl p-6`}>
            <h3 className={`${stat.textColor} mb-3`}>{stat.shift}</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Employees</span>
                <span className="font-bold">{stat.employees}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Coverage</span>
                <span className="font-bold text-green-600">{stat.coverage}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3>Shift Templates</h3>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm">
              <Plus className="w-4 h-4" />
              New Template
            </button>
          </div>
          <div className="space-y-3">
            {shiftTemplates.map((template) => (
              <div key={template.id} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{template.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-2 hover:bg-secondary rounded-md transition-colors">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-secondary rounded-md transition-colors">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{template.shifts}</p>
              </div>
            ))}
          </div>
        </div>

        <RecentShiftChanges />
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="mb-4">Employee Shift Assignments</h3>
        <div className="space-y-2">
          {employees.map((employee) => (
            <div key={employee.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-4">
                <div>
                  <span className="font-medium">{employee.name}</span>
                  <span className="text-sm text-muted-foreground ml-3">{employee.id}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded text-sm ${
                  employee.assignedShift === 'shift1' ? 'bg-blue-500/10 text-blue-600' :
                  employee.assignedShift === 'shift2' ? 'bg-orange-500/10 text-orange-600' :
                  'bg-purple-500/10 text-purple-600'
                }`}>
                  {employee.assignedShift === 'shift1' ? 'Shift 1' :
                   employee.assignedShift === 'shift2' ? 'Shift 2' : 'Shift 3'}
                </span>
                <button
                  onClick={() => employee.assignedShift && handleOpenDialog(employee.id, employee.name, employee.assignedShift)}
                  className="px-3 py-1 bg-secondary hover:bg-secondary/80 rounded transition-colors text-sm"
                >
                  Change
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {dialogState && (
        <ShiftChangeDialog
          isOpen={dialogState.isOpen}
          onClose={handleCloseDialog}
          employeeId={dialogState.employeeId}
          employeeName={dialogState.employeeName}
          currentShift={dialogState.currentShift}
        />
      )}
    </div>
  );
}
