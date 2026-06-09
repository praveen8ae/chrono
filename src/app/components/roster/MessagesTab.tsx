import { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Assignment } from '../../types/assignment';
import { Employee } from '../../types/employee';
import { User } from '../../types/user';
import { Message } from '../../types/message';
import { useRosterStore } from '../../store/rosterStore';

type MessagesTabProps = {
  assignment: Assignment | null;
  employee: Employee;
  currentUser: User;
};

export function MessagesTab({ assignment, employee, currentUser }: MessagesTabProps) {
  const { addMessage, getMessages, updateAssignment, loadMessages } = useRosterStore();

  const assignmentId = assignment?.id || '';
  const messages = getMessages(assignmentId);

  useEffect(() => {
    if (assignmentId) {
      loadMessages(assignmentId);
    }
  }, [assignmentId, loadMessages]);

  const [messageText, setMessageText] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !assignmentId || !assignment) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      assignmentId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      content: messageText,
      timestamp: new Date().toISOString()
    };

    addMessage(assignmentId, newMessage);

    // Update message count on assignment
    const updatedAssignment = {
      ...assignment,
      messageCount: (assignment.messageCount || 0) + 1
    };
    updateAssignment(updatedAssignment);

    setMessageText('');
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No messages yet. Start a conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.senderId === currentUser.id;
            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl p-4 ${
                    isCurrentUser
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{message.senderName}</span>
                    <span className="text-xs opacity-70">
                      {message.senderRole === 'admin' ? '(Admin)' : '(Employee)'}
                    </span>
                  </div>
                  <p className="mb-2">{message.content}</p>
                  <span className="text-xs opacity-70">{formatTime(message.timestamp)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          Send
        </button>
      </form>
    </div>
  );
}
