// AI Doubt Solver - Chat component for students to ask subject doubts
import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Trash2, Copy, Check, X, Sparkles, Loader2 } from 'lucide-react';
import { streamAIChat } from '@/lib/aiChat';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AIDoubtSolverProps {
  isOpen: boolean;
  onClose: () => void;
  classTitle: string;
  subject: string;
}

type Message = { role: 'user' | 'assistant'; content: string };

const AIDoubtSolver: React.FC<AIDoubtSolverProps> = ({ isOpen, onClose, classTitle, subject }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    let assistantSoFar = '';
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: 'assistant', content: assistantSoFar }];
      });
    };

    try {
      await streamAIChat({
        messages: [...messages, userMsg],
        mode: 'doubt',
        subject,
        classTitle,
        onDelta: upsertAssistant,
        onDone: () => setIsLoading(false),
        onError: (err) => {
          toast.error(err);
          setIsLoading(false);
        },
      });
    } catch {
      toast.error('Failed to connect to AI');
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    toast.success('Copied!');
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleClear = () => {
    setMessages([]);
    toast.success('Chat cleared');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 animate-fade-in">
      <div className="bg-card rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-xl animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-google-sans text-foreground font-medium">AI Doubt Solver</h3>
              <p className="text-xs text-on-surface-variant">{classTitle} • {subject}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={handleClear} className="gc-btn-icon" title="Clear chat">
              <Trash2 className="w-4 h-4 text-on-surface-variant" />
            </button>
            <button onClick={onClose} className="gc-btn-icon">
              <X className="w-5 h-5 text-on-surface-variant" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <Bot className="w-16 h-16 text-primary/30 mx-auto mb-4" />
              <p className="text-on-surface-variant font-medium">Ask any doubt about {subject}</p>
              <p className="text-sm text-on-surface-variant/70 mt-1">I can help with theory, programming, assignments & more</p>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {['Explain this concept', 'Help with assignment', 'Code example'].map(q => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className="gc-chip hover:bg-primary/10 transition-colors cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={cn("flex gap-3", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                msg.role === 'user'
                  ? 'bg-primary text-white rounded-br-md'
                  : 'bg-surface-variant text-foreground rounded-bl-md'
              )}>
                <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => handleCopy(msg.content, idx)}
                    className="mt-2 text-xs flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {copiedIdx === idx ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedIdx === idx ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              </div>
              <div className="bg-surface-variant rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-on-surface-variant/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-on-surface-variant/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-on-surface-variant/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-border">
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Type your doubt..."
              className="flex-1 py-2.5 px-4 bg-surface-variant rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="gc-btn-icon bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDoubtSolver;
