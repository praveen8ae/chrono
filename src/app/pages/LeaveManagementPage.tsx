import { useState } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, X } from 'lucide-react';
import { useLeaveStore } from '../store/leaveStore';

export function LeaveManagementPage() {
  const { leaveRequests, isLoading, updateRequestStatus } = useLeaveStore();
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<{ id: string; action: 'approve' | 'reject' } | null>(null);
  const [adminMessage, setAdminMessage] = useState('');

  const handleApprove = (requestId: string) => {
    setSelectedRequest({ id: requestId, action: 'approve' });
    setShowMessageDialog(true);
  };

  const handleReject = (requestId: string) => {
    setSelectedRequest({ id: requestId, action: 'reject' });
    setShowMessageDialog(true);
  };

  const handleSubmitDecision = async () => {
    if (!selectedRequest) return;
    await updateRequestStatus(
      selectedRequest.id,
      selectedRequest.action === 'approve' ? 'approved' : 'rejected',
      adminMessage.trim() || undefined,
    );
    setShowMessageDialog(false);
    setSelectedRequest(null);
    setAdminMessage('');
  };

  const handleCancelDialog = () => {
    setShowMessageDialog(false);
    setSelectedRequest(null);
    setAdminMessage('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default:         return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default:         return <Clock className="w-4 h-4" />;
    }
  };

  const pendingCount  = leaveRequests.filter(r => r.status === 'pending').length;
  const approvedCount = leaveRequests.filter(r => r.status === 'approved').length;
  const rejectedCount = leaveRequests.filter(r => r.status === 'rejected').length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="mb-2">Leave Management</h1>
        <p className="text-muted-foreground">Review, approve, and track employee leave requests and time-off balances</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6 text-yellow-600" />
            <h3 className="text-yellow-600">Pending Requests</h3>
          </div>
          <p className="text-3xl font-bold">{pendingCount}</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h3 className="text-green-600">Approved</h3>
          </div>
          <p className="text-3xl font-bold">{approvedCount}</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="w-6 h-6 text-red-600" />
            <h3 className="text-red-600">Rejected</h3>
          </div>
          <p className="text-3xl font-bold">{rejectedCount}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
        {isLoading ? (
          <div className="text-center py-16 text-muted-foreground">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p>Loading leave requests…</p>
          </div>
        ) : leaveRequests.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>No leave requests yet.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-muted border-b border-border">
                <th className="text-left p-4 font-medium">Employee</th>
                <th className="text-left p-4 font-medium">Leave Type</th>
                <th className="text-left p-4 font-medium">Dates</th>
                <th className="text-left p-4 font-medium">Duration</th>
                <th className="text-left p-4 font-medium">Reason</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.map((request) => (
                <tr key={request.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium">{request.employeeName}</div>
                    <div className="text-sm text-muted-foreground">{request.employeeId}</div>
                  </td>
                  <td className="p-4">{request.type}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {new Date(request.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {' – '}
                        {new Date(request.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">{request.days} {request.days === 1 ? 'day' : 'days'}</td>
                  <td className="p-4">
                    <div className="text-sm text-muted-foreground max-w-xs">
                      <div className="truncate">{request.reason}</div>
                      {request.adminMessage && (
                        <div className="mt-1 text-xs text-primary italic">Admin: {request.adminMessage}</div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs border ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      <span className="capitalize">{request.status}</span>
                    </span>
                  </td>
                  <td className="p-4">
                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(request.id)}
                          className="px-3 py-1 bg-green-500/10 text-green-600 rounded hover:bg-green-500/20 transition-colors text-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          className="px-3 py-1 bg-red-500/10 text-red-600 rounded hover:bg-red-500/20 transition-colors text-sm"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showMessageDialog && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">
                {selectedRequest.action === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
              </h3>
              <button onClick={handleCancelDialog} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Message to Employee <span className="text-muted-foreground">(Optional)</span>
              </label>
              <textarea
                value={adminMessage}
                onChange={(e) => setAdminMessage(e.target.value)}
                placeholder={
                  selectedRequest.action === 'approve'
                    ? 'e.g., Approved. Enjoy your time off!'
                    : 'e.g., Please provide more details about your request.'
                }
                className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring resize-none h-24"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCancelDialog}
                className="flex-1 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitDecision}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  selectedRequest.action === 'approve'
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                {selectedRequest.action === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
