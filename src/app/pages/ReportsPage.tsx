import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Calendar, Clock } from 'lucide-react';

export function ReportsPage() {
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
    <div>
      <div className="mb-8">
        <h1 className="mb-2">Reports & Analytics</h1>
        <p className="text-muted-foreground">Comprehensive workforce insights, attendance metrics, and performance analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-blue-600" />
            <h3 className="text-sm text-muted-foreground">Total Employees</h3>
          </div>
          <p className="text-3xl font-bold">15</p>
          <p className="text-xs text-muted-foreground mt-2">Active workforce</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <h3 className="text-sm text-muted-foreground">Attendance Rate</h3>
          </div>
          <p className="text-3xl font-bold">87%</p>
          <p className="text-xs text-green-600 mt-2">+5% from last month</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-6 h-6 text-orange-600" />
            <h3 className="text-sm text-muted-foreground">Leave Requests</h3>
          </div>
          <p className="text-3xl font-bold">8</p>
          <p className="text-xs text-muted-foreground mt-2">This month</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6 text-purple-600" />
            <h3 className="text-sm text-muted-foreground">Avg Hours/Week</h3>
          </div>
          <p className="text-3xl font-bold">42</p>
          <p className="text-xs text-muted-foreground mt-2">Per employee</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
                  <Cell key={`cell-${entry.id}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { id: 'act1', time: '2 hours ago', text: 'Employee 1 requested leave for May 20-22', type: 'leave' },
            { id: 'act2', time: '5 hours ago', text: 'Employee 5 marked present for today', type: 'attendance' },
            { id: 'act3', time: '1 day ago', text: 'Shift 2 schedule updated for next week', type: 'schedule' },
            { id: 'act4', time: '2 days ago', text: 'Employee 8 leave request rejected', type: 'leave' }
          ].map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div className="flex-1">
                <p className="text-sm">{activity.text}</p>
                <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
