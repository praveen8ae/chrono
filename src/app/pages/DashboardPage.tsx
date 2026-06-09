import { useState } from 'react';
import { useRosterStore } from '../store/rosterStore';
import { Calendar, UserPlus, UserMinus, UserCog, RefreshCw, ChevronLeft, ChevronRight, TrendingUp, Users, Clock } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function DashboardPage() {
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

  const attendanceData = [
    { id: 'mon', name: 'Mon', present: 12, absent: 3, halfDay: 0 },
    { id: 'tue', name: 'Tue', present: 13, absent: 2, halfDay: 0 },
    { id: 'wed', name: 'Wed', present: 11, absent: 2, halfDay: 2 },
    { id: 'thu', name: 'Thu', present: 14, absent: 1, halfDay: 0 },
    { id: 'fri', name: 'Fri', present: 12, absent: 1, halfDay: 2 },
    { id: 'sat', name: 'Sat', present: 10, absent: 3, halfDay: 2 },
    { id: 'sun', name: 'Sun', present: 8, absent: 5, halfDay: 2 }
  ];

  const shiftDistribution = [
    { id: 'shift1', name: 'Shift 1', value: 5 },
    { id: 'shift2', name: 'Shift 2', value: 5 },
    { id: 'shift3', name: 'Shift 3', value: 5 }
  ];

  const COLORS = ['#3b82f6', '#f97316', '#a855f7'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold mb-2">Dashboard Overview</h2>
        <p className="text-muted-foreground">Real-time workforce metrics, activity logs, and system insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg p-6 border">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Employees</h3>
          <p className="text-3xl font-bold">{activityLogs.length > 0 ? '156' : '0'}</p>
        </div>

        <div className="bg-card rounded-lg p-6 border">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Active Shifts</h3>
          <p className="text-3xl font-bold">{activityLogs.length > 0 ? '3,432' : '0'}</p>
        </div>

        <div className="bg-card rounded-lg p-6 border">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Coverage Rate</h3>
          <p className="text-3xl font-bold">{activityLogs.length > 0 ? '96%' : '0%'}</p>
        </div>

        <div className="bg-card rounded-lg p-6 border">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Leave Requests</h3>
          <p className="text-3xl font-bold">{activityLogs.length > 0 ? '12' : '0'}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-primary" />
            <h3>Activity Logs</h3>
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

        <div className="flex items-center gap-4 mb-6">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <UserPlus className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-sm font-medium">Employees Added</h3>
            </div>
            <p className="text-2xl font-bold">
              {logs.filter(l => l.type === 'employee_added').length}
            </p>
          </div>

          <div className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <UserCog className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-sm font-medium">Updates</h3>
            </div>
            <p className="text-2xl font-bold">
              {logs.filter(l => l.type === 'employee_updated').length}
            </p>
          </div>

          <div className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <RefreshCw className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-sm font-medium">Shift Changes</h3>
            </div>
            <p className="text-2xl font-bold">
              {logs.filter(l => l.type === 'shift_changed').length}
            </p>
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
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

      <div className="bg-card border border-border rounded-2xl p-6">
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

      <div className="border-t border-border pt-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Analytics & Reports</h2>
          <p className="text-muted-foreground">Workforce insights and performance metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <h3 className="text-sm text-muted-foreground">Attendance Rate</h3>
            </div>
            <p className="text-3xl font-bold">{activityLogs.length > 0 ? '87%' : '0%'}</p>
            <p className="text-xs text-green-600 mt-2">{activityLogs.length > 0 ? '+5% from last month' : 'No data yet'}</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-blue-600" />
              <h3 className="text-sm text-muted-foreground">Active Employees</h3>
            </div>
            <p className="text-3xl font-bold">{activityLogs.length > 0 ? '15' : '0'}</p>
            <p className="text-xs text-muted-foreground mt-2">Active workforce</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-6 h-6 text-purple-600" />
              <h3 className="text-sm text-muted-foreground">Avg Hours/Week</h3>
            </div>
            <p className="text-3xl font-bold">{activityLogs.length > 0 ? '42' : '0'}</p>
            <p className="text-xs text-muted-foreground mt-2">Per employee</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="mb-4">Weekly Attendance Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" fill="#22c55e" name="Present" />
                <Bar dataKey="halfDay" fill="#eab308" name="Half Day" />
                <Bar dataKey="absent" fill="#ef4444" name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="mb-4">Shift Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={shiftDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {shiftDistribution.map((entry, index) => (
                    <Cell key={entry.id} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
