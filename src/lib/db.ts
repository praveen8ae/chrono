import { supabase } from './supabase';
import type { Employee } from '../app/types/employee';
import type { Assignment } from '../app/types/assignment';
import type { Message } from '../app/types/message';
import type { LeaveBalance } from '../app/types/leave';

// All CHRONO app tables are prefixed with "shift_" to avoid conflicts
// with any pre-existing tables in the Supabase project.
const T = {
  employees:     'shift_employees',
  assignments:   'shift_assignments',
  messages:      'shift_messages',
  leaveRequests: 'shift_leave_requests',
  activityLogs:  'shift_activity_logs',
  shiftChanges:  'shift_changes',
  shiftSwaps:    'shift_swaps',
  leaveBalances: 'shift_leave_balances',
} as const;

export type DbLeaveRequest = {
  id: string;
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  days: number;
  type: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  adminMessage?: string;
};

export type DbActivityLog = {
  id: string;
  type: 'employee_added' | 'employee_updated' | 'employee_deleted' | 'shift_changed';
  description: string;
  details?: string;
  timestamp: Date;
  userId: string;
  userName: string;
};

export type DbShiftChange = {
  id: string;
  employeeId: string;
  employeeName: string;
  fromShift: 'shift1' | 'shift2' | 'shift3';
  toShift: 'shift1' | 'shift2' | 'shift3';
  timestamp: Date;
  reason?: string;
};

export type DbShiftSwap = {
  id: string;
  employee1Id: string;
  employee1Name: string;
  employee1Date: string;
  employee2Id: string;
  employee2Name: string;
  employee2Date: string;
  timestamp: Date;
};

export const db = {
  employees: {
    getAll: async (): Promise<Employee[]> => {
      const { data, error } = await supabase
        .from(T.employees)
        .select('*')
        .order('id');
      if (error) throw error;
      return (data ?? []).map(r => ({
        id: r.id,
        name: r.name,
        role: r.role,
        email: r.email,
        phone: r.phone,
        department: r.department,
        assignedShift: r.assigned_shift,
        avatar: r.avatar ?? undefined,
      }));
    },

    insert: async (employee: Employee): Promise<void> => {
      const { error } = await supabase.from(T.employees).insert({
        id: employee.id,
        name: employee.name,
        role: employee.role,
        email: employee.email,
        phone: employee.phone,
        department: employee.department,
        assigned_shift: employee.assignedShift,
        avatar: employee.avatar ?? null,
      });
      if (error) throw error;
    },

    update: async (id: string, updates: Partial<Employee>): Promise<void> => {
      const row: Record<string, unknown> = {};
      if (updates.name !== undefined)          row.name = updates.name;
      if (updates.role !== undefined)          row.role = updates.role;
      if (updates.email !== undefined)         row.email = updates.email;
      if (updates.phone !== undefined)         row.phone = updates.phone;
      if (updates.department !== undefined)    row.department = updates.department;
      if (updates.assignedShift !== undefined) row.assigned_shift = updates.assignedShift;
      if (updates.avatar !== undefined)        row.avatar = updates.avatar ?? null;
      const { error } = await supabase.from(T.employees).update(row).eq('id', id);
      if (error) throw error;
    },

    delete: async (id: string): Promise<void> => {
      const { error } = await supabase.from(T.employees).delete().eq('id', id);
      if (error) throw error;
    },
  },

  assignments: {
    getByMonth: async (year: number, month: number): Promise<Assignment[]> => {
      const mm = String(month + 1).padStart(2, '0');
      const lastDay = new Date(year, month + 1, 0).getDate();
      const start = `${year}-${mm}-01`;
      const end   = `${year}-${mm}-${String(lastDay).padStart(2, '0')}`;
      const { data, error } = await supabase
        .from(T.assignments)
        .select('*')
        .gte('date', start)
        .lte('date', end);
      if (error) throw error;
      return (data ?? []).map(r => ({
        id: r.id,
        employeeId: r.employee_id,
        date: r.date,
        shiftType: r.shift_type,
        status: r.status,
        messageCount: r.message_count,
        notes: r.notes ?? undefined,
      }));
    },

    upsert: async (assignment: Assignment): Promise<void> => {
      const { error } = await supabase.from(T.assignments).upsert({
        id: assignment.id,
        employee_id: assignment.employeeId,
        date: assignment.date,
        shift_type: assignment.shiftType,
        status: assignment.status,
        message_count: assignment.messageCount ?? 0,
        notes: assignment.notes ?? null,
      }, { onConflict: 'employee_id,date' });
      if (error) throw error;
    },
  },

  messages: {
    getByAssignment: async (assignmentId: string): Promise<Message[]> => {
      const { data, error } = await supabase
        .from(T.messages)
        .select('*')
        .eq('assignment_id', assignmentId)
        .order('created_at');
      if (error) throw error;
      return (data ?? []).map(r => ({
        id: r.id,
        assignmentId: r.assignment_id,
        senderId: r.sender_id,
        senderName: r.sender_name,
        senderRole: r.sender_role as 'admin' | 'employee',
        content: r.content,
        timestamp: r.timestamp,
      }));
    },

    insert: async (message: Message): Promise<void> => {
      const { error } = await supabase.from(T.messages).insert({
        id: message.id,
        assignment_id: message.assignmentId,
        sender_id: message.senderId,
        sender_name: message.senderName,
        sender_role: message.senderRole,
        content: message.content,
        timestamp: message.timestamp,
      });
      if (error) throw error;
    },
  },

  leaveRequests: {
    getAll: async (): Promise<DbLeaveRequest[]> => {
      const { data, error } = await supabase
        .from(T.leaveRequests)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(r => ({
        id: r.id,
        employeeId: r.employee_id,
        employeeName: r.employee_name,
        startDate: r.start_date,
        endDate: r.end_date,
        days: r.days,
        type: r.type,
        reason: r.reason,
        status: r.status as 'pending' | 'approved' | 'rejected',
        adminMessage: r.admin_message ?? undefined,
      }));
    },

    insert: async (req: DbLeaveRequest): Promise<void> => {
      const { error } = await supabase.from(T.leaveRequests).insert({
        id: req.id,
        employee_id: req.employeeId,
        employee_name: req.employeeName,
        start_date: req.startDate,
        end_date: req.endDate,
        days: req.days,
        type: req.type,
        reason: req.reason,
        status: req.status,
        admin_message: req.adminMessage ?? null,
      });
      if (error) throw error;
    },

    updateStatus: async (
      id: string,
      status: 'approved' | 'rejected',
      adminMessage?: string,
    ): Promise<void> => {
      const { error } = await supabase
        .from(T.leaveRequests)
        .update({ status, admin_message: adminMessage ?? null })
        .eq('id', id);
      if (error) throw error;
    },
  },

  activityLogs: {
    getAll: async (): Promise<DbActivityLog[]> => {
      const { data, error } = await supabase
        .from(T.activityLogs)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []).map(r => ({
        id: r.id,
        type: r.type as DbActivityLog['type'],
        description: r.description,
        details: r.details ?? undefined,
        timestamp: new Date(r.timestamp),
        userId: r.user_id,
        userName: r.user_name,
      }));
    },

    insert: async (log: DbActivityLog): Promise<void> => {
      const { error } = await supabase.from(T.activityLogs).insert({
        id: log.id,
        type: log.type,
        description: log.description,
        details: log.details ?? null,
        timestamp: log.timestamp.toISOString(),
        user_id: log.userId,
        user_name: log.userName,
      });
      if (error) throw error;
    },
  },

  shiftChanges: {
    getAll: async (): Promise<DbShiftChange[]> => {
      const { data, error } = await supabase
        .from(T.shiftChanges)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []).map(r => ({
        id: r.id,
        employeeId: r.employee_id,
        employeeName: r.employee_name,
        fromShift: r.from_shift as DbShiftChange['fromShift'],
        toShift: r.to_shift as DbShiftChange['toShift'],
        reason: r.reason ?? undefined,
        timestamp: new Date(r.timestamp),
      }));
    },

    insert: async (change: DbShiftChange): Promise<void> => {
      const { error } = await supabase.from(T.shiftChanges).insert({
        id: change.id,
        employee_id: change.employeeId,
        employee_name: change.employeeName,
        from_shift: change.fromShift,
        to_shift: change.toShift,
        reason: change.reason ?? null,
        timestamp: change.timestamp.toISOString(),
      });
      if (error) throw error;
    },
  },

  shiftSwaps: {
    getAll: async (): Promise<DbShiftSwap[]> => {
      const { data, error } = await supabase
        .from(T.shiftSwaps)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []).map(r => ({
        id: r.id,
        employee1Id: r.employee1_id,
        employee1Name: r.employee1_name,
        employee1Date: r.employee1_date,
        employee2Id: r.employee2_id,
        employee2Name: r.employee2_name,
        employee2Date: r.employee2_date,
        timestamp: new Date(r.timestamp),
      }));
    },

    insert: async (swap: DbShiftSwap): Promise<void> => {
      const { error } = await supabase.from(T.shiftSwaps).insert({
        id: swap.id,
        employee1_id: swap.employee1Id,
        employee1_name: swap.employee1Name,
        employee1_date: swap.employee1Date,
        employee2_id: swap.employee2Id,
        employee2_name: swap.employee2Name,
        employee2_date: swap.employee2Date,
        timestamp: swap.timestamp.toISOString(),
      });
      if (error) throw error;
    },
  },

  leaveBalances: {
    getAll: async (): Promise<LeaveBalance[]> => {
      const { data, error } = await supabase.from(T.leaveBalances).select('*');
      if (error) throw error;
      return (data ?? []).map(r => ({
        employeeId: r.employee_id,
        annualLeave: r.annual_leave,
        sickLeave: r.sick_leave,
        usedAnnual: r.used_annual,
        usedSick: r.used_sick,
      }));
    },

    getByEmployee: async (employeeId: string): Promise<LeaveBalance | null> => {
      const { data, error } = await supabase
        .from(T.leaveBalances)
        .select('*')
        .eq('employee_id', employeeId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        employeeId: data.employee_id,
        annualLeave: data.annual_leave,
        sickLeave: data.sick_leave,
        usedAnnual: data.used_annual,
        usedSick: data.used_sick,
      };
    },

    upsert: async (balance: LeaveBalance): Promise<void> => {
      const { error } = await supabase.from(T.leaveBalances).upsert({
        employee_id: balance.employeeId,
        annual_leave: balance.annualLeave,
        sick_leave: balance.sickLeave,
        used_annual: balance.usedAnnual,
        used_sick: balance.usedSick,
      });
      if (error) throw error;
    },
  },
};
