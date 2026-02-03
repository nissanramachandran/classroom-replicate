import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useClassroom } from '@/contexts/ClassroomContext';
import { toast } from 'sonner';
import { DEFAULT_TOPICS } from '@/types/classroom';

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
}

const CreateAssignmentModal: React.FC<CreateAssignmentModalProps> = ({
  isOpen,
  onClose,
  classId,
}) => {
  const { createAssignment } = useClassroom();
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [points, setPoints] = useState(100);
  const [dueDate, setDueDate] = useState('');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    setLoading(true);
    const { error } = await createAssignment({
      class_id: classId,
      title: title.trim(),
      instructions: instructions.trim() || undefined,
      points,
      due_date: dueDate || undefined,
      topic: topic || undefined,
    });
    setLoading(false);

    if (error) {
      toast.error('Failed to create assignment');
    } else {
      toast.success('Assignment created!');
      // Reset form
      setTitle('');
      setInstructions('');
      setPoints(100);
      setDueDate('');
      setTopic('');
      onClose();
    }
  };

  return (
    <div className="gc-dialog animate-fade-in">
      <div className="gc-dialog-content animate-scale-in max-w-2xl">
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
              className="gc-input min-h-[120px] resize-none"
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
              className="gc-input"
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
              disabled={!title.trim() || loading}
              className="gc-btn-primary"
            >
              {loading ? 'Creating...' : 'Assign'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAssignmentModal;
