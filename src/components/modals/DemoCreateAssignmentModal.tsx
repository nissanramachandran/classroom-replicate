import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { DEFAULT_TOPICS } from '@/types/classroom';

interface DemoCreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  onSubmit?: (data: any) => void;
}

const DemoCreateAssignmentModal: React.FC<DemoCreateAssignmentModalProps> = ({
  isOpen,
  onClose,
  classId,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [points, setPoints] = useState(100);
  const [dueDate, setDueDate] = useState('');
  const [topic, setTopic] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    const assignmentData = {
      class_id: classId,
      title: title.trim(),
      instructions: instructions.trim() || null,
      points,
      due_date: dueDate || null,
      topic: topic || null,
    };

    if (onSubmit) {
      onSubmit(assignmentData);
    }
    
    toast.success('Assignment created!');
    // Reset form
    setTitle('');
    setInstructions('');
    setPoints(100);
    setDueDate('');
    setTopic('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="gc-dialog w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-google-sans text-foreground">Create assignment</h2>
          <button onClick={onClose} className="gc-btn-icon">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">
              Title (required)
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Assignment title"
              className="gc-input"
              required
            />
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">
              Instructions (optional)
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Add instructions for your students"
              className="gc-input min-h-[120px] resize-none w-full"
            />
          </div>

          {/* Points and Due date row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">
                Points
              </label>
              <Input
                type="number"
                value={points}
                onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                min={0}
                max={1000}
                className="gc-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">
                Due date (optional)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                <Input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="gc-input pl-10"
                />
              </div>
            </div>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">
              Topic (optional)
            </label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="gc-input w-full"
            >
              <option value="">No topic</option>
              {DEFAULT_TOPICS.filter(t => t !== 'No topic').map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="gc-btn-text"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim()}
              className="gc-btn-primary"
            >
              Assign
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DemoCreateAssignmentModal;
