export type Message = {
  id: string;
  assignmentId: string;
  senderId: string;
  senderName: string;
  senderRole: 'admin' | 'employee';
  content: string;
  timestamp: string;
};
