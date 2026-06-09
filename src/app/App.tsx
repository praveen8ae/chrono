import { useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { DetailModal } from './components/roster/DetailModal';
import { Toaster } from 'sonner';
import { useRosterStore } from './store/rosterStore';
import { useAuthStore } from './store/authStore';
import { useLeaveStore } from './store/leaveStore';
import SignInPage from './pages/SignInPage';
import { DashboardPage } from './pages/DashboardPage';
import { RosterPage } from './pages/RosterPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { LeaveManagementPage } from './pages/LeaveManagementPage';
import { ShiftPlanningPage } from './pages/ShiftPlanningPage';

export default function App() {
  const { currentPage, setCurrentPage, initialize } = useRosterStore();
  const { user, loading, checkAuth } = useAuthStore();
  const { loadLeaveData } = useLeaveStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user) {
      initialize();
      loadLeaveData();
    }
  }, [user, initialize, loadLeaveData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p className="mt-4 text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <SignInPage />;
  }

  const getAvailablePage = () => {
    if (user.role === 'admin') return currentPage;
    if (currentPage === 'roster' || currentPage === 'leave-management') return currentPage;
    return 'roster';
  };

  const renderPage = () => {
    const page = getAvailablePage();
    switch (page) {
      case 'dashboard':
        return user.role === 'admin' ? <DashboardPage /> : null;
      case 'roster':
        return <RosterPage />;
      case 'employees':
        return user.role === 'admin' ? <EmployeesPage /> : null;
      case 'leave-management':
        return <LeaveManagementPage />;
      case 'shift-planning':
        return user.role === 'admin' ? <ShiftPlanningPage /> : null;
      default:
        return user.role === 'admin' ? <DashboardPage /> : <RosterPage />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Topbar />
      <main className="pt-28 px-10 pb-10">
        {renderPage()}
      </main>
      <DetailModal />
      <Toaster position="top-right" />
    </div>
  );
}
