import { useState, useEffect } from 'react';
import { X, Calendar, MessageSquare, Briefcase, Clock } from 'lucide-react';
import { useRosterStore } from '../../store/rosterStore';
import { useAuthStore } from '../../store/authStore';
import { useLeaveStore } from '../../store/leaveStore';
import { WorkdayTab } from './WorkdayTab';
import { MessagesTab } from './MessagesTab';
import { LeaveTab } from './LeaveTab';
import { CalendarTab } from './CalendarTab';

type Tab = 'workday' | 'messages' | 'leave' | 'calendar';

export function DetailModal() {
  const { modal, closeModal, employees } = useRosterStore();
  const { user } = useAuthStore();
  const { leaveBalances } = useLeaveStore();
  const [activeTab, setActiveTab] = useState<Tab>('workday');

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [closeModal]);

  if (!modal.isOpen) return null;

  const employee = employees.find(e => e.id === modal.selectedEmployeeId);
  if (!employee) return null;

  const formattedDate = modal.selectedDate
    ? new Date(modal.selectedDate).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : '';

  // authStore uses 'admin'|'user' but the messages DB constraint uses 'admin'|'employee'
  const currentUser = user
    ? {
        id: user.id,
        name: user.name,
        email: user.email,
        role: (user.role === 'admin' ? 'admin' : 'employee') as 'admin' | 'employee',
      }
    : { id: 'guest', name: 'Guest', email: '', role: 'employee' as const };

  const tabs = [
    { id: 'workday'  as Tab, label: 'Workday',       icon: Calendar },
    { id: 'messages' as Tab, label: 'Messages',      icon: MessageSquare },
    { id: 'leave'    as Tab, label: 'Leave Overview', icon: Briefcase },
    { id: 'calendar' as Tab, label: 'Calendar',      icon: Clock },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="mb-1">{employee.name}</h2>
              <p className="text-muted-foreground">{formattedDate}</p>
            </div>
            <button
              onClick={closeModal}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'workday' && (
            <WorkdayTab
              assignment={modal.selectedAssignment}
              employee={employee}
              date={modal.selectedDate}
            />
          )}
          {activeTab === 'messages' && (
            <MessagesTab
              assignment={modal.selectedAssignment}
              employee={employee}
              currentUser={currentUser}
            />
          )}
          {activeTab === 'leave' && (
            <LeaveTab
              employeeId={employee.id}
              leaveBalance={leaveBalances[employee.id]}
            />
          )}
          {activeTab === 'calendar' && (
            <CalendarTab
              assignment={modal.selectedAssignment}
              employee={employee}
              date={modal.selectedDate}
            />
          )}
        </div>
      </div>
    </div>
  );
}
