import { ShiftType } from './shift';

export type AssignmentStatus = 'scheduled' | 'present' | 'half-day' | 'absent' | 'off' | 'leave';

export type Assignment = {
  id: string;
  employeeId: string;
  date: string;
  shiftType: ShiftType | null;
  status: AssignmentStatus;
  messageCount: number;
  notes?: string;
};
