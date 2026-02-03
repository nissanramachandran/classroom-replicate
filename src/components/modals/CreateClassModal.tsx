import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BANNER_COLORS } from '@/types/classroom';
import { cn } from '@/lib/utils';

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    section?: string;
    subject?: string;
    room?: string;
    banner_color: string;
  }) => Promise<void>;
  loading?: boolean;
}

const CreateClassModal: React.FC<CreateClassModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
}) => {
  const [title, setTitle] = useState('');
  const [section, setSection] = useState('');
  const [subject, setSubject] = useState('');
  const [room, setRoom] = useState('');
  const [bannerColor, setBannerColor] = useState<string>(BANNER_COLORS[0]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      title,
      section: section || undefined,
      subject: subject || undefined,
      room: room || undefined,
      banner_color: bannerColor,
    });
    // Reset form
    setTitle('');
    setSection('');
    setSubject('');
    setRoom('');
    setBannerColor(BANNER_COLORS[0]);
  };

  return (
    <div className="gc-dialog animate-fade-in">
      <div className="gc-dialog-content animate-scale-in max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-google-sans text-foreground">Create class</h2>
          <button onClick={onClose} className="gc-btn-icon">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">
              Class name (required)
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter class name"
              className="gc-input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">
              Section
            </label>
            <Input
              value={section}
              onChange={(e) => setSection(e.target.value)}
              placeholder="e.g., Period 1"
              className="gc-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">
              Subject
            </label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Mathematics"
              className="gc-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">
              Room
            </label>
            <Input
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="e.g., Room 101"
              className="gc-input"
            />
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-2">
              Theme color
            </label>
            <div className="flex gap-2 flex-wrap">
              {BANNER_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setBannerColor(color)}
                  className={cn(
                    'w-8 h-8 rounded-full transition-all',
                    bannerColor === color && 'ring-2 ring-offset-2 ring-primary'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
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
              {loading ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClassModal;
