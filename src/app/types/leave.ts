export type LeaveType = 'annual' | 'sick' | 'personal' | 'holiday';

export type LeaveBalance = {
  employeeId: string;
  annualLeave: number;
  sickLeave: number;
  usedAnnual: number;
  usedSick: number;
};

export type LeaveRequest = {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  type: LeaveType;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
};
