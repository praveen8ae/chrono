import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, Filter, Download, Activity, Menu, Check } from 'lucide-react';
import { useRosterStore } from '../../store/rosterStore';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'sonner';

export function Topbar() {
  const { currentMonth, setCurrentMonth, toggleSidebar, isSidebarOpen, assignments, employees } = useRosterStore();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showHealthMenu, setShowHealthMenu] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    present: true,
    off: true,
    leave: true,
    halfDay: true,
    absent: true
  });
  const filterRef = useRef<HTMLDivElement>(null);
  const healthRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
      if (healthRef.current && !healthRef.current.contains(event.target as Node)) {
        setShowHealthMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getSystemHealth = () => {
    const totalEmployees = employees.length;
    const assignedEmployees = employees.filter(e => e.assignedShift !== null).length;
    const totalAssignments = assignments.length;
    const presentCount = assignments.filter(a => a.status === 'present' || a.status === 'scheduled').length;
    const absentCount = assignments.filter(a => a.status === 'absent').length;

    const healthScore = totalEmployees > 0 ? Math.round((assignedEmployees / totalEmployees) * 100) : 100;

    return {
      status: healthScore >= 90 ? 'Healthy' : healthScore >= 70 ? 'Warning' : 'Critical',
      color: healthScore >= 90 ? 'green' : healthScore >= 70 ? 'yellow' : 'red',
      score: healthScore,
      totalEmployees,
      assignedEmployees,
      idleEmployees: totalEmployees - assignedEmployees,
      totalAssignments,
      presentCount,
      absentCount
    };
  };

  const health = getSystemHealth();

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



  const toggleFilter = (filter: keyof typeof activeFilters) => {
    setActiveFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
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
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <div ref={healthRef} className="relative">
          <button
            onClick={() => setShowHealthMenu(!showHealthMenu)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer ${
              health.color === 'green' ? 'bg-green-500/10 text-green-600' :
              health.color === 'yellow' ? 'bg-yellow-500/10 text-yellow-600' :
              'bg-red-500/10 text-red-600'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span className="text-sm font-medium">System {health.status}</span>
          </button>

          {showHealthMenu && (
            <div className="absolute top-full right-0 mt-2 bg-card border border-border rounded-lg shadow-xl p-4 w-72 z-50">
              <h3 className="font-medium mb-3">System Health Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Health Score</span>
                  <span className={`font-medium ${
                    health.color === 'green' ? 'text-green-600' :
                    health.color === 'yellow' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>{health.score}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Employees</span>
                  <span className="font-medium">{health.totalEmployees}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assigned to Shifts</span>
                  <span className="font-medium">{health.assignedEmployees}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Idle/Available</span>
                  <span className="font-medium">{health.idleEmployees}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Assignments</span>
                  <span className="font-medium">{health.totalAssignments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Present Count</span>
                  <span className="font-medium text-green-600">{health.presentCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Absent Count</span>
                  <span className="font-medium text-red-600">{health.absentCount}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div ref={filterRef} className="relative">
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>

          {showFilterMenu && (
            <div className="absolute top-full right-0 mt-2 bg-card border border-border rounded-lg shadow-xl p-4 w-64 z-50">
              <h3 className="font-medium mb-3">Filter Status Types</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={activeFilters.present}
                    onChange={() => toggleFilter('present')}
                    className="w-4 h-4"
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-3 h-3 rounded bg-green-500" />
                    <span className="text-sm">Present (P)</span>
                  </div>
                  {activeFilters.present && <Check className="w-4 h-4 text-primary" />}
                </label>

                <label className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={activeFilters.off}
                    onChange={() => toggleFilter('off')}
                    className="w-4 h-4"
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-3 h-3 rounded bg-gray-400" />
                    <span className="text-sm">Off Day (-)</span>
                  </div>
                  {activeFilters.off && <Check className="w-4 h-4 text-primary" />}
                </label>

                <label className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={activeFilters.leave}
                    onChange={() => toggleFilter('leave')}
                    className="w-4 h-4"
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-3 h-3 rounded bg-blue-500" />
                    <span className="text-sm">Leave (L)</span>
                  </div>
                  {activeFilters.leave && <Check className="w-4 h-4 text-primary" />}
                </label>

                <label className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={activeFilters.halfDay}
                    onChange={() => toggleFilter('halfDay')}
                    className="w-4 h-4"
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-3 h-3 rounded bg-yellow-500" />
                    <span className="text-sm">Half Day (H)</span>
                  </div>
                  {activeFilters.halfDay && <Check className="w-4 h-4 text-primary" />}
                </label>

                <label className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={activeFilters.absent}
                    onChange={() => toggleFilter('absent')}
                    className="w-4 h-4"
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-3 h-3 rounded bg-red-500" />
                    <span className="text-sm">Absent (A)</span>
                  </div>
                  {activeFilters.absent && <Check className="w-4 h-4 text-primary" />}
                </label>
              </div>
              <button
                onClick={() => {
                  setActiveFilters({
                    present: true,
                    off: true,
                    leave: true,
                    halfDay: true,
                    absent: true
                  });
                  toast.success('All filters enabled');
                }}
                className="w-full mt-3 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>
    </div>
  );
}
