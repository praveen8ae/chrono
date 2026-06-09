import { useState, useRef, useEffect } from 'react';
import { MessageCircle, ArrowRightLeft } from 'lucide-react';
import { Assignment } from '../../types/assignment';
import { SHIFTS } from '../../types/shift';
import { useRosterStore } from '../../store/rosterStore';

type RosterCellProps = {
  assignment: Assignment | null;
  onClick: () => void;
  employeeId: string;
  date: string;
  isEditMode?: boolean;
};

export function RosterCell({ assignment, onClick, employeeId, date, isEditMode = false }: RosterCellProps) {
  const { getSwapForAssignment, employees, updateAssignment } = useRosterStore();
  const [showEditMenu, setShowEditMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const swap = getSwapForAssignment(employeeId, date);
  const hasSwap = !!swap;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowEditMenu(false);
      }
    };

    if (showEditMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEditMenu]);

  const handleCellClick = () => {
    if (isEditMode) {
      setShowEditMenu(!showEditMenu);
    } else {
      onClick();
    }
  };

  const handleStatusChange = (status: 'present' | 'off' | 'leave' | 'half-day' | 'absent') => {
    if (assignment) {
      updateAssignment({ ...assignment, status });
    } else {
      const employee = employees.find(e => e.id === employeeId);
      if (employee) {
        const newAssignment: Assignment = {
          id: `${employeeId}-${date}`,
          employeeId,
          date,
          shiftType: employee.assignedShift,
          status,
          messageCount: 0,
        };
        updateAssignment(newAssignment);
      }
    }
    setShowEditMenu(false);
  };

  let swapInfo = '';
  if (swap) {
    const isEmployee1 = swap.employee1Id === employeeId && swap.employee1Date === date;
    const otherEmployeeId = isEmployee1 ? swap.employee2Id : swap.employee1Id;
    const otherEmployee = employees.find(e => e.id === otherEmployeeId);
    const otherDate = isEmployee1 ? swap.employee2Date : swap.employee1Date;

    if (otherEmployee) {
      const dateObj = new Date(otherDate);
      swapInfo = `↔ ${otherEmployee.name.split(' ')[1]} (${dateObj.getDate()}/${dateObj.getMonth() + 1})`;
    }
  }

  const statusOptions = [
    { value: 'present', label: 'P', name: 'Present', color: 'bg-green-500/20 hover:bg-green-500/30 text-green-700' },
    { value: 'off', label: '-', name: 'Off Day', color: 'bg-gray-400/20 hover:bg-gray-400/30 text-gray-600' },
    { value: 'leave', label: 'L', name: 'Leave', color: 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-700' },
    { value: 'half-day', label: 'H', name: 'Half Day', color: 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-700' },
    { value: 'absent', label: 'A', name: 'Absent', color: 'bg-red-500/20 hover:bg-red-500/30 text-red-700' }
  ];

  if (!assignment) {
    return (
      <div
        onClick={handleCellClick}
        className={`h-[60px] w-full rounded-md cursor-pointer transition-colors relative flex items-center justify-center ${
          isEditMode ? 'hover:bg-primary/10 ring-1 ring-primary/20' : 'hover:bg-secondary/50'
        }`}
        data-employee-id={employeeId}
        data-date={date}
      >
        <div className="absolute -top-1 -right-1 flex items-center">
          {hasSwap && (
            <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center border border-card relative z-10">
              <span className="text-[9px] text-white font-bold">S</span>
            </div>
          )}
        </div>
        {swapInfo && (
          <div className="absolute bottom-0 left-0 right-0 bg-orange-500/20 px-1 py-0.5">
            <span className="text-[7px] text-orange-700 font-medium truncate block text-center">
              {swapInfo}
            </span>
          </div>
        )}

        {showEditMenu && isEditMode && (
          <div
            ref={menuRef}
            className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-xl z-50 min-w-[140px]"
          >
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(option.value as any);
                }}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg flex items-center justify-between ${option.color}`}
              >
                <span>{option.name}</span>
                <span className="font-bold">{option.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const getStatusColor = () => {
    switch (assignment.status) {
      case 'scheduled':
      case 'present':
        return 'bg-green-500/20 border-green-500/40 text-green-700 hover:bg-green-500/30';
      case 'half-day':
        return 'bg-yellow-500/20 border-yellow-500/40 text-yellow-700 hover:bg-yellow-500/30';
      case 'absent':
        return 'bg-red-500/20 border-red-500/40 text-red-700 hover:bg-red-500/30';
      case 'leave':
        return 'bg-blue-500/20 border-blue-500/40 text-blue-700 hover:bg-blue-500/30';
      case 'off':
        return 'bg-gray-400/20 border-gray-400/40 text-gray-600 hover:bg-gray-400/30';
      default:
        return 'bg-muted border-border hover:bg-muted/80';
    }
  };

  const getStatusIcon = () => {
    switch (assignment.status) {
      case 'scheduled':
      case 'present':
        return 'P';
      case 'half-day':
        return 'H';
      case 'absent':
        return 'A';
      case 'leave':
        return 'L';
      case 'off':
        return '-';
      default:
        return '';
    }
  };

  return (
    <div
      onClick={handleCellClick}
      className={`h-[60px] w-full rounded-md cursor-pointer transition-all ${getStatusColor()} ${
        isEditMode ? 'ring-1 ring-primary/30' : ''
      } flex flex-col items-center justify-center relative`}
      data-employee-id={employeeId}
      data-date={date}
    >
      <span className="text-sm font-bold">{getStatusIcon()}</span>

      <div className="absolute -top-1 -right-1 flex items-center">
        {hasSwap && (
          <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center border border-card relative z-10">
            <span className="text-[9px] text-white font-bold">S</span>
          </div>
        )}
        {assignment.messageCount > 0 && (
          <div className={`w-4 h-4 bg-black rounded-full flex items-center justify-center border border-card ${hasSwap ? '-ml-2' : ''}`}>
            <span className="text-[9px] text-white font-bold">{assignment.messageCount}</span>
          </div>
        )}
      </div>

      {swapInfo && (
        <div className="absolute bottom-0 left-0 right-0 bg-orange-500/20 px-1 py-0.5">
          <span className="text-[7px] text-orange-700 font-medium truncate block text-center">
            {swapInfo}
          </span>
        </div>
      )}

      {showEditMenu && isEditMode && (
        <div
          ref={menuRef}
          className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-xl z-50 min-w-[140px]"
        >
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange(option.value as any);
              }}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg flex items-center justify-between ${option.color}`}
            >
              <span>{option.name}</span>
              <span className="font-bold">{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
