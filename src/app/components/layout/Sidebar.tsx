import { useState } from 'react';
import { LayoutDashboard, Users, Calendar, Settings, X, CalendarDays, LogOut } from 'lucide-react';
import { useRosterStore } from '../../store/rosterStore';
import { useAuthStore } from '../../store/authStore';

export function Sidebar() {
  const { isSidebarOpen, setSidebarOpen, employees, setCurrentPage } = useRosterStore();
  const { user, signOut } = useAuthStore();
  const [activeMenuItem, setActiveMenuItem] = useState('Roster');

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', adminOnly: true },
    { icon: CalendarDays, label: 'Roster' },
    { icon: Users, label: 'Employees', adminOnly: true },
    { icon: Calendar, label: 'Leave Management' },
    { icon: Settings, label: 'Shift Planning', adminOnly: true }
  ];

  const getPageFromLabel = (label: string) => {
    switch (label) {
      case 'Dashboard':
        return 'dashboard';
      case 'Roster':
        return 'roster';
      case 'Employees':
        return 'employees';
      case 'Leave Management':
        return 'leave-management';
      case 'Shift Planning':
        return 'shift-planning';
      default:
        return 'dashboard';
    }
  };

  const handleMenuClick = (label: string) => {
    setActiveMenuItem(label);
    setCurrentPage(getPageFromLabel(label) as any);
    setSidebarOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  // Filter menu items based on role
  const visibleMenuItems = menuItems.filter(item => {
    if (item.adminOnly && user?.role !== 'admin') {
      return false;
    }
    return true;
  });

  const activeEmployees = employees.length;
  const totalShifts = activeEmployees * 22;
  const coverage = activeEmployees > 0 ? 96 : 0;

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className={`w-64 bg-[#1a1a1a] text-white h-screen flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <div>
            <h1 className="text-2xl">CHRONO</h1>
            <p className="text-xs text-white/60 mt-1">Workforce Management</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => handleMenuClick(item.label)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeMenuItem === item.label
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

        <div className="p-4 border-t border-white/10 space-y-4">
        <div className="bg-white/5 rounded-lg p-4 space-y-3">
          <h3 className="text-sm text-white/80">Workforce Stats</h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Active Employees</span>
              <span className="text-white font-medium">{activeEmployees}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Total Shifts</span>
              <span className="text-white font-medium">{totalShifts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Coverage</span>
              <span className="text-green-400 font-medium">{coverage}%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="font-medium">
              {user?.email.split('@')[0][0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.email}</p>
            <p className="text-xs text-white/60 capitalize">{user?.role}</p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/60 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
        </div>
      </div>
    </>
  );
}
