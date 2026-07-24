import { create } from 'zustand';
import { Assignment, TaskQueue } from '../types/assignment';
import { Message } from '../types/message';
import { Employee } from '../types/employee';
import { db } from '../../lib/db';
import { useAuthStore } from './authStore';

type ModalState = {
  isOpen: boolean;
  selectedAssignment: Assignment | null;
  selectedDate: string | null;
  selectedEmployeeId: string | null;
};

type PageType = 'dashboard' | 'roster' | 'employees' | 'leave-management' | 'shift-planning';

export type ShiftChange = {
  id: string;
  employeeId: string;
  employeeName: string;
  fromShift: 'shift1' | 'shift2' | 'shift3';
  toShift: 'shift1' | 'shift2' | 'shift3';
  timestamp: Date;
  reason?: string;
};

export type ActivityLog = {
  id: string;
  type: 'employee_added' | 'employee_updated' | 'employee_deleted' | 'shift_changed';
  description: string;
  details?: string;
  timestamp: Date;
  userId: string;
  userName: string;
};

export type ShiftSwap = {
  id: string;
  employee1Id: string;
  employee1Name: string;
  employee1Date: string;
  employee2Id: string;
  employee2Name: string;
  employee2Date: string;
  timestamp: Date;
};

type RosterStore = {
  currentMonth: Date;
  assignments: Assignment[];
  messages: Record<string, Message[]>;
  modal: ModalState;
  isSidebarOpen: boolean;
  currentPage: PageType;
  shiftChanges: ShiftChange[];
  employees: Employee[];
  activityLogs: ActivityLog[];
  swaps: ShiftSwap[];
  assignmentHistory: Assignment[][];
  historyIndex: number;
  isLoading: boolean;
  dbReady: boolean;

  initialize: () => Promise<void>;
  loadAssignments: (year: number, month: number) => Promise<void>;
  loadMessages: (assignmentId: string) => Promise<void>;

  setCurrentMonth: (month: Date) => void;
  setAssignments: (assignments: Assignment[]) => void;
  updateAssignment: (assignment: Assignment) => void;
  addAssignmentTask: (employeeId: string, date: string, task: TaskQueue) => void;
  removeAssignmentTask: (employeeId: string, date: string, task: TaskQueue) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  openModal: (employeeId: string, date: string, assignment: Assignment | null) => void;
  closeModal: () => void;

  addMessage: (assignmentId: string, message: Message) => void;
  getMessages: (assignmentId: string) => Message[];

  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setCurrentPage: (page: PageType) => void;

  addShiftChange: (change: Omit<ShiftChange, 'id' | 'timestamp'>) => void;
  getRecentShiftChanges: (limit?: number) => ShiftChange[];
  updateEmployeeShift: (employeeId: string, newShift: 'shift1' | 'shift2' | 'shift3', reason?: string) => void;
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  removeEmployee: (employeeId: string) => void;
  updateEmployee: (employeeId: string, updates: Partial<Omit<Employee, 'id'>>) => void;
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'timestamp' | 'userId' | 'userName'>) => void;
  getActivityLogsByDate: (date: Date) => ActivityLog[];
  addSwap: (swap: Omit<ShiftSwap, 'id' | 'timestamp'>) => void;
  getSwapForAssignment: (employeeId: string, date: string) => ShiftSwap | null;
};

const getAuthUser = () => useAuthStore.getState().user;

const newId = () => Math.random().toString(36).substr(2, 9);

export const useRosterStore = create<RosterStore>((set, get) => ({
  currentMonth: new Date(2026, 4, 1),
  assignments: [],
  messages: {},
  modal: {
    isOpen: false,
    selectedAssignment: null,
    selectedDate: null,
    selectedEmployeeId: null,
  },
  isSidebarOpen: false,
  currentPage: 'roster',
  shiftChanges: [],
  employees: [],
  activityLogs: [],
  swaps: [],
  assignmentHistory: [],
  historyIndex: -1,
  isLoading: false,
  dbReady: false,

  initialize: async () => {
    set({ isLoading: true });
    try {
      const [employees, activityLogs, shiftChanges, swaps] = await Promise.all([
        db.employees.getAll(),
        db.activityLogs.getAll(),
        db.shiftChanges.getAll(),
        db.shiftSwaps.getAll(),
      ]);
      set({ employees, activityLogs, shiftChanges, swaps, isLoading: false, dbReady: true });
    } catch (err) {
      console.error('Failed to initialize data from Supabase:', err);
      set({ isLoading: false, dbReady: false });
    }
  },

  loadAssignments: async (year, month) => {
    try {
      const assignments = await db.assignments.getByMonth(year, month);
      const tasksResult = await db.assignmentTasks.getByMonth(year, month).catch((err) => {
        console.warn('Assignment task table is not ready:', err);
        return [];
      });
      const taskQueuesByAssignment = new Map<string, TaskQueue[]>();
      tasksResult.forEach((task) => {
        const key = `${task.employeeId}:${task.date}`;
        taskQueuesByAssignment.set(key, [...(taskQueuesByAssignment.get(key) ?? []), task.taskName]);
      });
      const assignmentsWithTasks = assignments.map((assignment) => ({
        ...assignment,
        taskQueues: taskQueuesByAssignment.get(`${assignment.employeeId}:${assignment.date}`) ?? [],
      }));
      set({
        assignments: assignmentsWithTasks,
        assignmentHistory: [JSON.parse(JSON.stringify(assignmentsWithTasks))],
        historyIndex: 0,
      });
    } catch (err) {
      console.error('Failed to load assignments:', err);
      set({ assignments: [], assignmentHistory: [[]], historyIndex: 0 });
    }
  },

  loadMessages: async (assignmentId) => {
    try {
      const messages = await db.messages.getByAssignment(assignmentId);
      set(state => ({
        messages: { ...state.messages, [assignmentId]: messages },
      }));
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  },

  setCurrentMonth: (month) => set({ currentMonth: month }),

  setAssignments: (assignments) => {
    const state = get();
    const newHistory = state.assignmentHistory.slice(0, state.historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(assignments)));
    set({
      assignments,
      assignmentHistory: newHistory.slice(-50),
      historyIndex: Math.min(newHistory.length - 1, 49),
    });
  },

  updateAssignment: (assignment) => {
    const state = get();
    const exists = state.assignments.some(a => a.id === assignment.id);
    const newAssignments = exists
      ? state.assignments.map(a => a.id === assignment.id ? assignment : a)
      : [...state.assignments, assignment];
    const newHistory = state.assignmentHistory.slice(0, state.historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newAssignments)));
    set((currentState) => ({
      assignments: newAssignments,
      assignmentHistory: newHistory.slice(-50),
      historyIndex: Math.min(newHistory.length - 1, 49),
      modal: currentState.modal.selectedAssignment?.id === assignment.id
        ? { ...currentState.modal, selectedAssignment: assignment }
        : currentState.modal,
    }));
    db.assignments.upsert(assignment).catch(console.error);
  },

  addAssignmentTask: (employeeId, date, task) => {
    set((state) => ({
      assignments: state.assignments.map((assignment) =>
        assignment.employeeId === employeeId && assignment.date === date
          ? { ...assignment, taskQueues: [...(assignment.taskQueues ?? []), task] }
          : assignment,
      ),
      modal: state.modal.selectedAssignment?.employeeId === employeeId && state.modal.selectedAssignment.date === date
        ? { ...state.modal, selectedAssignment: { ...state.modal.selectedAssignment, taskQueues: [...(state.modal.selectedAssignment.taskQueues ?? []), task] } }
        : state.modal,
    }));
    db.assignmentTasks.insert({ id: crypto.randomUUID(), employeeId, date, taskName: task }).catch(console.error);
  },

  removeAssignmentTask: (employeeId, date, task) => {
    set((state) => ({
      assignments: state.assignments.map((assignment) =>
        assignment.employeeId === employeeId && assignment.date === date
          ? { ...assignment, taskQueues: (assignment.taskQueues ?? []).filter((item) => item !== task) }
          : assignment,
      ),
      modal: state.modal.selectedAssignment?.employeeId === employeeId && state.modal.selectedAssignment.date === date
        ? { ...state.modal, selectedAssignment: { ...state.modal.selectedAssignment, taskQueues: (state.modal.selectedAssignment.taskQueues ?? []).filter((item) => item !== task) } }
        : state.modal,
    }));
    db.assignmentTasks.delete(employeeId, date, task).catch(console.error);
  },

  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      set({
        assignments: JSON.parse(JSON.stringify(state.assignmentHistory[newIndex])),
        historyIndex: newIndex,
      });
    }
  },

  redo: () => {
    const state = get();
    if (state.historyIndex < state.assignmentHistory.length - 1) {
      const newIndex = state.historyIndex + 1;
      set({
        assignments: JSON.parse(JSON.stringify(state.assignmentHistory[newIndex])),
        historyIndex: newIndex,
      });
    }
  },

  canUndo: () => get().historyIndex > 0,

  canRedo: () => get().historyIndex < get().assignmentHistory.length - 1,

  openModal: (employeeId, date, assignment) => set({
    modal: { isOpen: true, selectedAssignment: assignment, selectedDate: date, selectedEmployeeId: employeeId },
  }),

  closeModal: () => set({
    modal: { isOpen: false, selectedAssignment: null, selectedDate: null, selectedEmployeeId: null },
  }),

  addMessage: (assignmentId, message) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [assignmentId]: [...(state.messages[assignmentId] || []), message],
      },
    }));
    db.messages.insert(message).catch(console.error);
  },

  getMessages: (assignmentId) => get().messages[assignmentId] || [],

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

  setCurrentPage: (page) => set({ currentPage: page }),

  addShiftChange: (change) => {
    const newChange: ShiftChange = {
      ...change,
      id: newId(),
      timestamp: new Date(),
    };
    set((state) => ({ shiftChanges: [newChange, ...state.shiftChanges] }));
    db.shiftChanges.insert(newChange).catch(console.error);
  },

  getRecentShiftChanges: (limit = 5) => get().shiftChanges.slice(0, limit),

  updateEmployeeShift: (employeeId, newShift, reason) => {
    const employee = get().employees.find(e => e.id === employeeId);
    if (!employee) return;
    const oldShift = employee.assignedShift;
    set((state) => ({
      employees: state.employees.map(e =>
        e.id === employeeId ? { ...e, assignedShift: newShift } : e,
      ),
    }));
    db.employees.update(employeeId, { assignedShift: newShift }).catch(console.error);
    if (oldShift) {
      get().addShiftChange({ employeeId, employeeName: employee.name, fromShift: oldShift, toShift: newShift, reason });
    }
    const shiftName = (s: string | null) =>
      s === 'shift1' ? 'Shift 1' : s === 'shift2' ? 'Shift 2' : s === 'shift3' ? 'Shift 3' : (s ?? 'None');
    get().addActivityLog({
      type: 'shift_changed',
      description: `Changed shift for ${employee.name} from ${shiftName(oldShift)} to ${shiftName(newShift)}`,
      details: reason,
    });
  },

  addEmployee: (employee) => {
    const employees = get().employees;
    const ids = employees.map(e => parseInt(e.id.substring(1))).filter(n => !isNaN(n));
    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    const newEmployee: Employee = { ...employee, id: `Z${String(maxId + 1).padStart(4, '0')}` };
    set((state) => ({ employees: [...state.employees, newEmployee] }));
    db.employees.insert(newEmployee).catch(console.error);
    get().addActivityLog({
      type: 'employee_added',
      description: `Added new employee: ${employee.name} (${newEmployee.id})`,
      details: `Department: ${employee.department}, Shift: ${employee.assignedShift}`,
    });
  },

  removeEmployee: (employeeId) => {
    const employee = get().employees.find(e => e.id === employeeId);
    set((state) => ({ employees: state.employees.filter(e => e.id !== employeeId) }));
    db.employees.delete(employeeId).catch(console.error);
    if (employee) {
      get().addActivityLog({
        type: 'employee_deleted',
        description: `Deleted employee: ${employee.name} (${employeeId})`,
        details: `Former department: ${employee.department}`,
      });
    }
  },

  updateEmployee: (employeeId, updates) => {
    const employee = get().employees.find(e => e.id === employeeId);
    set((state) => ({
      employees: state.employees.map(e =>
        e.id === employeeId ? { ...e, ...updates } : e,
      ),
    }));
    db.employees.update(employeeId, updates).catch(console.error);
    if (employee) {
      get().addActivityLog({
        type: 'employee_updated',
        description: `Updated employee: ${employee.name} (${employeeId})`,
        details: `Updated fields: ${Object.keys(updates).join(', ')}`,
      });
    }
  },

  addActivityLog: (log) => {
    const authUser = getAuthUser();
    const newLog: ActivityLog = {
      ...log,
      id: newId(),
      timestamp: new Date(),
      userId: authUser?.id || 'system',
      userName: authUser?.name || (authUser?.email ? authUser.email.split('@')[0] : 'System'),
    };
    set((state) => ({ activityLogs: [newLog, ...state.activityLogs] }));
    db.activityLogs.insert(newLog).catch(console.error);
  },

  getActivityLogsByDate: (date) => {
    const start = new Date(date); start.setHours(0, 0, 0, 0);
    const end   = new Date(date); end.setHours(23, 59, 59, 999);
    return get().activityLogs.filter(log => {
      const t = new Date(log.timestamp);
      return t >= start && t <= end;
    });
  },

  addSwap: (swap) => {
    const newSwap: ShiftSwap = { ...swap, id: newId(), timestamp: new Date() };
    set((state) => ({ swaps: [...state.swaps, newSwap] }));
    db.shiftSwaps.insert(newSwap).catch(console.error);

    // Swap the assignment data between the two cells
    const state = get();
    const a1 = state.assignments.find(a => a.employeeId === swap.employee1Id && a.date === swap.employee1Date);
    const a2 = state.assignments.find(a => a.employeeId === swap.employee2Id && a.date === swap.employee2Date);
    if (a1 && a2) {
      const swapped1 = { ...a1, shiftType: a2.shiftType, status: a2.status };
      const swapped2 = { ...a2, shiftType: a1.shiftType, status: a1.status };
      set(s => ({
        assignments: s.assignments.map(a => {
          if (a.employeeId === swap.employee1Id && a.date === swap.employee1Date) return swapped1;
          if (a.employeeId === swap.employee2Id && a.date === swap.employee2Date) return swapped2;
          return a;
        }),
      }));
      db.assignments.upsert(swapped1).catch(console.error);
      db.assignments.upsert(swapped2).catch(console.error);
    }

    get().addActivityLog({
      type: 'shift_changed',
      description: `Swapped shifts between ${swap.employee1Name} (${swap.employee1Date}) and ${swap.employee2Name} (${swap.employee2Date})`,
      details: 'Shift swap completed',
    });
  },

  getSwapForAssignment: (employeeId, date) =>
    get().swaps.find(s =>
      (s.employee1Id === employeeId && s.employee1Date === date) ||
      (s.employee2Id === employeeId && s.employee2Date === date),
    ) || null,
}));
