// Class Discussion - Simple chat UI for classroom discussions
import React, { useState } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import { getDemoUser } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface DiscussionMessage {
  id: string;
  author: string;
  role: 'teacher' | 'student';
  content: string;
  timestamp: string;
}

interface ClassDiscussionProps {
  classId: string;
  isTeacher: boolean;
}

const INITIAL_MESSAGES: DiscussionMessage[] = [
  { id: 'd1', author: 'Tharani Vimal', role: 'teacher', content: 'Welcome to the class discussion! Feel free to ask questions here.', timestamp: new Date(Date.now() - 86400000).toISOString() },
  { id: 'd2', author: 'Nissan', role: 'student', content: 'Thank you! When is the next assignment due?', timestamp: new Date(Date.now() - 43200000).toISOString() },
  { id: 'd3', author: 'Tharani Vimal', role: 'teacher', content: 'The next assignment is due by Friday. Check the Classwork tab for details.', timestamp: new Date(Date.now() - 21600000).toISOString() },
];

const ClassDiscussion: React.FC<ClassDiscussionProps> = ({ classId, isTeacher }) => {
  const [messages, setMessages] = useState<DiscussionMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const profile = getDemoUser();

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const displayName = isTeacher ? 'Tharani Vimal' : 'Nissan';

  const handleSend = () => {
    if (!input.trim()) return;
    const msg: DiscussionMessage = {
      id: `d-${Date.now()}`,
      author: displayName,
      role: isTeacher ? 'teacher' : 'student',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, msg]);
    setInput('');
  };

  return (
    <div className="gc-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-primary" />
        <h3 className="font-google-sans text-foreground">Class Discussion</h3>
        <span className="gc-chip text-xs ml-auto">{messages.length} messages</span>
      </div>

      {/* Messages */}
      <div className="max-h-[350px] overflow-y-auto p-4 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className="flex items-start gap-3 animate-fade-in">
            <div className={cn(
              "gc-avatar gc-avatar-sm shrink-0 text-white",
              msg.role === 'teacher' ? 'bg-gc-green' : 'bg-primary'
            )}>
              {getInitials(msg.author)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-foreground">{msg.author}</span>
                <span className={cn("text-xs px-1.5 py-0.5 rounded",
                  msg.role === 'teacher' ? 'bg-gc-green/10 text-gc-green' : 'bg-primary/10 text-primary'
                )}>
                  {msg.role === 'teacher' ? 'Staff' : 'Student'}
                </span>
                <span className="text-xs text-on-surface-variant">
                  {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm text-foreground mt-1">{msg.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          className="flex-1 py-2 px-4 bg-surface-variant rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="gc-btn-icon bg-primary text-white disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ClassDiscussion;
