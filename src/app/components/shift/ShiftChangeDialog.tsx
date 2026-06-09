import { useState } from 'react';
import { X } from 'lucide-react';
import { useRosterStore } from '../../store/rosterStore';
import { toast } from 'sonner';

type ShiftChangeDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  employeeName: string;
  currentShift: 'shift1' | 'shift2' | 'shift3';
};

export function ShiftChangeDialog({
  isOpen,
  onClose,
  employeeId,
  employeeName,
  currentShift
}: ShiftChangeDialogProps) {
  const [selectedShift, setSelectedShift] = useState<'shift1' | 'shift2' | 'shift3'>(currentShift);
  const [reason, setReason] = useState('');
  const { updateEmployeeShift } = useRosterStore();

  if (!isOpen) return null;

  const shifts = [
    { id: 'shift1', name: 'Shift 1', time: '6:30 AM - 3:30 PM', color: 'bg-blue-500/10 border-blue-500/20 text-blue-600' },
    { id: 'shift2', name: 'Shift 2', time: '3:30 PM - 12:30 AM', color: 'bg-orange-500/10 border-orange-500/20 text-orange-600' },
    { id: 'shift3', name: 'Shift 3', time: '12:30 AM - 6:30 AM', color: 'bg-purple-500/10 border-purple-500/20 text-purple-600' }
  ];

  const handleSubmit = () => {
    if (selectedShift === currentShift) {
      toast.error('Please select a different shift');
      return;
    }

    updateEmployeeShift(employeeId, selectedShift, reason || undefined);

    const newShiftName = shifts.find(s => s.id === selectedShift)?.name;
    toast.success(`${employeeName} moved to ${newShiftName}`);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <h3>Change Shift Assignment</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-1">Employee</p>
          <p className="font-medium">{employeeName}</p>
          <p className="text-sm text-muted-foreground">{employeeId}</p>
        </div>

        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-3">Select New Shift</p>
          <div className="space-y-2">
            {shifts.map((shift) => (
              <button
                key={shift.id}
                onClick={() => setSelectedShift(shift.id as 'shift1' | 'shift2' | 'shift3')}
                className={`w-full p-4 border rounded-lg text-left transition-all ${
                  selectedShift === shift.id
                    ? `${shift.color} border-2`
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{shift.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">{shift.time}</p>
                  </div>
                  {currentShift === shift.id && (
                    <span className="text-xs bg-secondary px-2 py-1 rounded">Current</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="text-sm text-muted-foreground mb-2 block">
            Reason (Optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for shift change..."
            className="w-full p-3 border border-border rounded-lg bg-background resize-none"
            rows={3}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors"
          >
            Change Shift
          </button>
        </div>
      </div>
    </div>
  );
}
