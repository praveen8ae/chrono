import { AlertTriangle } from 'lucide-react';
import { useRosterStore } from '../../store/rosterStore';
import { toast } from 'sonner';

type DeleteConfirmDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  employeeName: string;
};

export function DeleteConfirmDialog({ isOpen, onClose, employeeId, employeeName }: DeleteConfirmDialogProps) {
  const { removeEmployee } = useRosterStore();

  if (!isOpen) return null;

  const handleDelete = () => {
    removeEmployee(employeeId);
    toast.success(`${employeeName} removed successfully`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-destructive/10 rounded-full">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <h3>Delete Employee</h3>
        </div>

        <p className="text-muted-foreground mb-6">
          Are you sure you want to delete <span className="font-medium text-foreground">{employeeName}</span> ({employeeId})? This action cannot be undone.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
