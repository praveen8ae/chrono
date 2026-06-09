export type ShiftType = 'shift1' | 'shift2' | 'shift3' | 'off';

export type Shift = {
  id: string;
  name: string;
  type: ShiftType;
  startTime: string;
  endTime: string;
  color: string;
};

export const SHIFTS: Record<ShiftType, Shift> = {
  shift1: {
    id: '1',
    name: 'Shift 1',
    type: 'shift1',
    startTime: '06:30',
    endTime: '15:30',
    color: 'blue'
  },
  shift2: {
    id: '2',
    name: 'Shift 2',
    type: 'shift2',
    startTime: '15:30',
    endTime: '00:30',
    color: 'orange'
  },
  shift3: {
    id: '3',
    name: 'Shift 3',
    type: 'shift3',
    startTime: '00:30',
    endTime: '06:30',
    color: 'purple'
  },
  off: {
    id: 'off',
    name: 'OFF',
    type: 'off',
    startTime: '',
    endTime: '',
    color: 'gray'
  }
};
