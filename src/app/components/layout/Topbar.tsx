import { Menu } from 'lucide-react';
import { useRosterStore } from '../../store/rosterStore';

export function Topbar() {
  const { toggleSidebar } = useRosterStore();

  return (
    <div className="h-16 bg-card border-b border-border flex items-center justify-between px-6 fixed top-0 right-0 left-0 z-30">
      <button
        onClick={toggleSidebar}
        className="p-2 hover:bg-secondary rounded-lg transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>
    </div>
  );
}
