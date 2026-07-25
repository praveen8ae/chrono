import { ShiftType } from './shift';

export type AssignmentStatus = 'scheduled' | 'present' | 'half-day' | 'absent' | 'off' | 'leave';

export const TASK_QUEUES = [' Accertify: Live Queue', 'Ethoca Manual Queue', 'Accertify: Chargebacks', 'Sharepoint: GCSS Reported Fraud', 
  'Accertify: Secondary Review Queue', 'Accertify: LS Cleanup Queue', 'Accertify: GC Queue', 'Sharepoint: Leadership Escalation Form Responses',
'Mailbox', 'Mailbox + Krypton', 'Mailbox + Accertify', 'Mailbox + Splunk', 'Sharepoint + Mailbox', 'Zoom: Calibratiion Calls', 'Sharepoint + Mailbox',
'Miscellaneous Project Work', 'Going over Misses report', 'Accertify: Going into Advanced View'] as const;
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
