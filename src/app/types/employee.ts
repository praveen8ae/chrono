export type Employee = {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatar?: string;
  department: string;
  assignedShift: 'shift1' | 'shift2' | 'shift3' | null;
};
