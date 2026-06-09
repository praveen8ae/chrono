import { Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { LeaveBalance } from '../../types/leave';

type LeaveTabProps = {
  employeeId: string;
  leaveBalance?: LeaveBalance;
};

export function LeaveTab({ employeeId, leaveBalance }: LeaveTabProps) {
  if (!leaveBalance) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Leave balance information not available</p>
      </div>
    );
  }

  const annualRemaining = leaveBalance.annualLeave - leaveBalance.usedAnnual;
  const sickRemaining = leaveBalance.sickLeave - leaveBalance.usedSick;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="text-blue-600">Annual Leave</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-medium">{leaveBalance.annualLeave} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Used</span>
              <span className="font-medium">{leaveBalance.usedAnnual} days</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-blue-500/20">
              <span className="font-medium">Remaining</span>
              <span className="font-medium text-blue-600">{annualRemaining} days</span>
            </div>
          </div>
          <div className="mt-4 bg-blue-500/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-full"
              style={{ width: `${(leaveBalance.usedAnnual / leaveBalance.annualLeave) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-green-600" />
            <h3 className="text-green-600">Sick Leave</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-medium">{leaveBalance.sickLeave} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Used</span>
              <span className="font-medium">{leaveBalance.usedSick} days</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-green-500/20">
              <span className="font-medium">Remaining</span>
              <span className="font-medium text-green-600">{sickRemaining} days</span>
            </div>
          </div>
          <div className="mt-4 bg-green-500/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-green-600 h-full"
              style={{ width: `${(leaveBalance.usedSick / leaveBalance.sickLeave) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="bg-muted/50 rounded-xl p-6">
        <h3 className="mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Leave Analytics
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Leave Available</span>
            <span className="font-medium">{leaveBalance.annualLeave + leaveBalance.sickLeave} days</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Used</span>
            <span className="font-medium">{leaveBalance.usedAnnual + leaveBalance.usedSick} days</span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-border">
            <span className="font-medium">Total Remaining</span>
            <span className="font-medium text-primary">{annualRemaining + sickRemaining} days</span>
          </div>
        </div>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-600 mb-1">Future Feature</h4>
            <p className="text-sm text-muted-foreground">
              Leave request workflow and approval system will be available in the next update.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
