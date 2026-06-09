import { ArrowRight, Clock } from 'lucide-react';
import { useRosterStore } from '../../store/rosterStore';
import { formatDistanceToNow } from 'date-fns';

export function RecentShiftChanges() {
  const { getRecentShiftChanges } = useRosterStore();
  const recentChanges = getRecentShiftChanges(5);

  const getShiftColor = (shift: 'shift1' | 'shift2' | 'shift3') => {
    switch (shift) {
      case 'shift1':
        return 'bg-blue-500/10 text-blue-600';
      case 'shift2':
        return 'bg-orange-500/10 text-orange-600';
      case 'shift3':
        return 'bg-purple-500/10 text-purple-600';
    }
  };

  const getShiftName = (shift: 'shift1' | 'shift2' | 'shift3') => {
    switch (shift) {
      case 'shift1':
        return 'Shift 1';
      case 'shift2':
        return 'Shift 2';
      case 'shift3':
        return 'Shift 3';
    }
  };

  if (recentChanges.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-primary" />
          <h3>Recent Shift Changes</h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-8">
          No recent shift changes
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-primary" />
        <h3>Recent Shift Changes</h3>
      </div>
      <div className="space-y-3">
        {recentChanges.map((change) => (
          <div
            key={change.id}
            className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium">{change.employeeName}</p>
                <p className="text-xs text-muted-foreground">{change.employeeId}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(change.timestamp, { addSuffix: true })}
              </p>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 rounded text-xs ${getShiftColor(change.fromShift)}`}>
                {getShiftName(change.fromShift)}
              </span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <span className={`px-2 py-1 rounded text-xs ${getShiftColor(change.toShift)}`}>
                {getShiftName(change.toShift)}
              </span>
            </div>
            {change.reason && (
              <p className="text-xs text-muted-foreground italic">
                "{change.reason}"
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
