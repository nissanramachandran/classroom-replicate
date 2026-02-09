// AI Staff Tools - Panel for teachers to generate assignments, quizzes, notes, announcements
import React, { useState } from 'react';
import { Sparkles, FileText, HelpCircle, BookOpen, Megaphone, X, Copy, Check, Loader2 } from 'lucide-react';
import { streamAIChat } from '@/lib/aiChat';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AIStaffToolsProps {
  isOpen: boolean;
  onClose: () => void;
  classTitle: string;
  subject: string;
}

type ToolMode = 'generate_assignment' | 'generate_quiz' | 'generate_notes' | 'generate_announcement';

const tools: { mode: ToolMode; label: string; icon: React.ElementType; description: string }[] = [
  { mode: 'generate_assignment', label: 'Generate Assignment', icon: FileText, description: 'Create a detailed assignment with instructions' },
  { mode: 'generate_quiz', label: 'Generate Quiz', icon: HelpCircle, description: 'Create quiz with multiple choice questions' },
  { mode: 'generate_notes', label: 'Generate Notes', icon: BookOpen, description: 'Create structured study notes summary' },
  { mode: 'generate_announcement', label: 'Generate Announcement', icon: Megaphone, description: 'Draft a professional class announcement' },
];

const AIStaffTools: React.FC<AIStaffToolsProps> = ({ isOpen, onClose, classTitle, subject }) => {
  const [selectedTool, setSelectedTool] = useState<ToolMode | null>(null);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!selectedTool || !prompt.trim()) return;
    setIsLoading(true);
    setResult('');

    let content = '';
    try {
      await streamAIChat({
        messages: [{ role: 'user', content: prompt }],
        mode: selectedTool,
        subject,
        classTitle,
        onDelta: (chunk) => {
          content += chunk;
          setResult(content);
        },
        onDone: () => setIsLoading(false),
        onError: (err) => {
          toast.error(err);
          setIsLoading(false);
        },
      });
    } catch {
      toast.error('Failed to generate content');
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success('Content copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade-in">
      <div className="bg-card rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-xl animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-gc-green/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gc-green flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-google-sans text-foreground font-medium">AI Staff Tools</h3>
              <p className="text-xs text-on-surface-variant">{classTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="gc-btn-icon">
            <X className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Tool Selection */}
          {!selectedTool ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tools.map(tool => (
                <button
                  key={tool.mode}
                  onClick={() => setSelectedTool(tool.mode)}
                  className="gc-card p-5 text-left hover:border-primary/30 border border-transparent transition-all group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <tool.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h4 className="font-google-sans text-foreground">{tool.label}</h4>
                  </div>
                  <p className="text-sm text-on-surface-variant">{tool.description}</p>
                </button>
              ))}
            </div>
          ) : (
            <>
              {/* Back button */}
              <button
                onClick={() => { setSelectedTool(null); setResult(''); setPrompt(''); }}
                className="text-sm text-primary hover:underline"
              >
                ← Back to tools
              </button>

              {/* Prompt Input */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Describe what you want to generate:
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={`E.g., "Create an assignment about data structures covering linked lists and trees"`}
                  className="w-full min-h-[100px] p-3 bg-surface-variant border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none text-foreground"
                />
                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isLoading}
                  className="gc-btn-primary px-5 py-2.5 mt-3 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate
                    </>
                  )}
                </button>
              </div>

              {/* Result */}
              {result && (
                <div className="bg-surface-variant rounded-lg p-4 relative">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-google-sans text-sm text-foreground">Generated Content</h4>
                    <button
                      onClick={handleCopy}
                      className="gc-btn text-xs px-3 py-1.5 bg-primary/10 text-primary rounded-full"
                    >
                      {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed max-h-[300px] overflow-y-auto">
                    {result}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIStaffTools;
