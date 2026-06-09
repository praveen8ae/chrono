import { create } from 'zustand';
import { db, type DbLeaveRequest } from '../../lib/db';
import type { LeaveBalance } from '../types/leave';

export type LeaveRequest = DbLeaveRequest;

type LeaveStore = {
  leaveRequests: LeaveRequest[];
  leaveBalances: Record<string, LeaveBalance>;
  isLoading: boolean;

  loadLeaveData: () => Promise<void>;
  updateRequestStatus: (
    id: string,
    status: 'approved' | 'rejected',
    adminMessage?: string,
  ) => Promise<void>;
};

export const useLeaveStore = create<LeaveStore>((set, get) => ({
  leaveRequests: [],
  leaveBalances: {},
  isLoading: false,

  loadLeaveData: async () => {
    set({ isLoading: true });
    try {
      const [requests, balances] = await Promise.all([
        db.leaveRequests.getAll(),
        db.leaveBalances.getAll(),
      ]);
      const balanceMap: Record<string, LeaveBalance> = {};
      for (const b of balances) balanceMap[b.employeeId] = b;
      set({ leaveRequests: requests, leaveBalances: balanceMap, isLoading: false });
    } catch (err) {
      console.error('Failed to load leave data:', err);
      set({ isLoading: false });
    }
  },

  updateRequestStatus: async (id, status, adminMessage) => {
    set(state => ({
      leaveRequests: state.leaveRequests.map(r =>
        r.id === id ? { ...r, status, adminMessage } : r,
      ),
    }));
    try {
      await db.leaveRequests.updateStatus(id, status, adminMessage);
    } catch (err) {
      console.error('Failed to update leave request:', err);
      // Re-fetch to keep in sync
      get().loadLeaveData();
    }
  },
}));
