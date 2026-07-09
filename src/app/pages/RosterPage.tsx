import { useState } from 'react';
import { ChevronLeft, ChevronRight, Menu, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useRosterStore } from '../store/rosterStore';
import { RosterGrid } from '../components/roster/RosterGrid';

export function RosterPage() {
  const { currentMonth, setCurrentMonth, employees, toggleSidebar } = useRosterStore();
  const [searchQuery, setSearchQuery] = useState('');

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const previousMonth = () => {
    const nextDate = new Date(currentMonth);
    nextDate.setMonth(nextDate.getMonth() - 1);
    setCurrentMonth(nextDate);
  };

  const nextMonth = () => {
    const nextDate = new Date(currentMonth);
    nextDate.setMonth(nextDate.getMonth() + 1);
    setCurrentMonth(nextDate);
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    const matches = employees.filter((employee) =>
      employee.name.toLowerCase().includes(query.toLowerCase()) ||
      employee.id.toLowerCase().includes(query.toLowerCase()),
    );

    if (matches.length > 0) {
      toast.success(`Found ${matches.length} employee(s): ${matches.map((employee) => employee.name).join(', ')}`);
    } else {
      toast.error('No employees found matching your search');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[auto_minmax(280px,420px)_1fr] lg:items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            aria-label="Open sidebar"
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
        </div>

        <form onSubmit={handleSearch} className="relative w-full lg:justify-self-center">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employees..."
            className="pl-10 pr-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring w-full"
          />
        </form>

        <div />
      </div>

      <RosterGrid />
    </div>
  );
}
