import { useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Download, Menu } from 'lucide-react';
import { useRosterStore } from '../../store/rosterStore';
import { toast } from 'sonner';

export function Topbar() {
  const { currentMonth, setCurrentMonth, toggleSidebar, assignments, employees, currentPage } = useRosterStore();
  const [searchQuery, setSearchQuery] = useState('');
  const isLeaveOrPlanningPage = currentPage === 'leave-management' || currentPage === 'shift-planning';
  const showMonthNavigation = currentPage !== 'employees' && !isLeaveOrPlanningPage;
  const showRosterActions = !isLeaveOrPlanningPage;

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const previousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const found = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (found.length > 0) {
        toast.success(`Found ${found.length} employee(s): ${found.map(e => e.name).join(', ')}`);
      } else {
        toast.error('No employees found matching your search');
      }
    }
  };
  const handleExport = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // CSV header
    let csv = 'Employee ID,Employee Name,Shift,';
    for (let day = 1; day <= daysInMonth; day++) {
      csv += `${day},`;
    }
    csv += '\n';

    // Add data for each employee
    employees.forEach(employee => {
      if (!employee.assignedShift) return;

      const shiftName = employee.assignedShift === 'shift1' ? 'Shift 1' :
                       employee.assignedShift === 'shift2' ? 'Shift 2' : 'Shift 3';
      csv += `${employee.id},${employee.name},${shiftName},`;

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = date.toISOString().split('T')[0];
        const assignment = assignments.find(a => a.employeeId === employee.id && a.date === dateStr);

        let cellValue = '';
        if (assignment) {
          switch (assignment.status) {
            case 'present':
            case 'scheduled':
              cellValue = 'P';
              break;
            case 'off':
              cellValue = '-';
              break;
            case 'leave':
              cellValue = 'L';
              break;
            case 'half-day':
              cellValue = 'H';
              break;
            case 'absent':
              cellValue = 'A';
              break;
            default:
              cellValue = '';
          }
        }
        csv += `${cellValue},`;
      }
      csv += '\n';
    });

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roster-${formatMonth(currentMonth).replace(' ', '-')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Roster exported successfully!');
  };

  return (
    <div className="h-16 bg-card border-b border-border flex items-center justify-between px-6 fixed top-0 right-0 left-0 z-30">
      <div className="flex items-center gap-6">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        {showMonthNavigation && (
          <div className="flex items-center gap-3">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="min-w-[200px] text-center">{formatMonth(currentMonth)}</h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {showRosterActions && (
          <form onSubmit={handleSearch} className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employees..."
              className="pl-10 pr-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring w-64"
            />
          </form>
        )}
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {showRosterActions && (
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        )}
      </div>
    </div>
  );
}
