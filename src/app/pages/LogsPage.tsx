import { useState } from 'react';
import { useRosterStore } from '../store/rosterStore';
import { Calendar, UserPlus, UserMinus, UserCog, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

export function LogsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { getActivityLogsByDate, activityLogs } = useRosterStore();

  const logs = getActivityLogsByDate(selectedDate);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'employee_added':
        return <UserPlus className="w-5 h-5 text-green-600" />;
      case 'employee_deleted':
        return <UserMinus className="w-5 h-5 text-red-600" />;
      case 'employee_updated':
        return <UserCog className="w-5 h-5 text-blue-600" />;
      case 'shift_changed':
        return <RefreshCw className="w-5 h-5 text-orange-600" />;
      default:
        return <Calendar className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'employee_added':
        return 'bg-green-500/10 border-green-500/20';
      case 'employee_deleted':
        return 'bg-red-500/10 border-red-500/20';
      case 'employee_updated':
        return 'bg-blue-500/10 border-blue-500/20';
      case 'shift_changed':
        return 'bg-orange-500/10 border-orange-500/20';
      default:
        return 'bg-muted border-border';
    }
  };

  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  const isFutureDate = selectedDate > new Date();

  return (
    <div>
      <div className="mb-8">
        <h1 className="mb-2">Activity Logs</h1>
        <p className="text-muted-foreground">Track all system activities and changes</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-primary" />
            <h3>Select Date</h3>
          </div>
          {!isToday && (
            <button
              onClick={handleToday}
              className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Today
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handlePreviousDay}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 text-center">
            <input
              type="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-center"
            />
            <p className="text-sm text-muted-foreground mt-2">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </p>
          </div>

          <button
            onClick={handleNextDay}
            disabled={isFutureDate}
            className={`p-2 rounded-lg transition-colors ${
              isFutureDate ? 'opacity-50 cursor-not-allowed' : 'hover:bg-secondary'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <UserPlus className="w-5 h-5 text-green-600" />
            </div>
            <h3>Employees Added</h3>
          </div>
          <p className="text-3xl font-bold">
            {logs.filter(l => l.type === 'employee_added').length}
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <UserCog className="w-5 h-5 text-blue-600" />
            </div>
            <h3>Updates</h3>
          </div>
          <p className="text-3xl font-bold">
            {logs.filter(l => l.type === 'employee_updated').length}
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <RefreshCw className="w-5 h-5 text-orange-600" />
            </div>
            <h3>Shift Changes</h3>
          </div>
          <p className="text-3xl font-bold">
            {logs.filter(l => l.type === 'shift_changed').length}
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="mb-4">Activity Timeline</h3>

        {logs.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No activities recorded for this date</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className={`p-4 border rounded-lg ${getActivityColor(log.type)}`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-background rounded-lg">
                    {getActivityIcon(log.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-medium">{log.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                    {log.details && (
                      <p className="text-sm text-muted-foreground">{log.details}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>By: {log.userName}</span>
                      <span>•</span>
                      <span>{format(log.timestamp, 'h:mm a')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 bg-card border border-border rounded-2xl p-6">
        <h3 className="mb-4">Overall Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-muted-foreground">Total Activities</span>
            <span className="font-medium">{activityLogs.length}</span>
          </div>
          <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-muted-foreground">Today's Activities</span>
            <span className="font-medium">
              {getActivityLogsByDate(new Date()).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
