import { ShiftType } from './shift';

export type AssignmentStatus = 'scheduled' | 'present' | 'half-day' | 'absent' | 'off' | 'leave';

export const TASK_QUEUES = ['Live Queue', 'Fraud Review', 'GC Queue', 'Reseller'] as const;
export type TaskQueue = (typeof TASK_QUEUES)[number];

export type Assignment = {
  id: string;
  employeeId: string;
  date: string;
  shiftType: ShiftType | null;
  status: AssignmentStatus;
  messageCount: number;
  notes?: string;
  taskQueues?: TaskQueue[];
};
