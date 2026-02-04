import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { BANNER_COLORS } from '@/types/classroom';
import { cn } from '@/lib/utils';

interface DemoCreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    section?: string;
    subject?: string;
    room?: string;
    banner_color: string;
  }) => void;
}

const DemoCreateClassModal: React.FC<DemoCreateClassModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [section, setSection] = useState('');
  const [subject, setSubject] = useState('');
  const [room, setRoom] = useState('');
  const [bannerColor, setBannerColor] = useState<string>(BANNER_COLORS[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Class name is required');
      return;
    }

    onSubmit({
      title: title.trim(),
      section: section.trim() || undefined,
      subject: subject.trim() || undefined,
      room: room.trim() || undefined,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="gc-dialog w-full max-w-md max-h-[90vh] overflow-y-auto">
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
              placeholder="Class name"
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
              placeholder="Period, class, or section"
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
              placeholder="Subject"
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
              placeholder="Room"
              className="gc-input"
            />
          </div>

          {/* Banner color picker */}
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-2">
              Banner color
            </label>
            <div className="flex flex-wrap gap-2">
              {BANNER_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setBannerColor(color)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-transform",
                    bannerColor === color && "ring-2 ring-offset-2 ring-primary scale-110"
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
              disabled={!title.trim()}
              className="gc-btn-primary"
            >
              Create
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DemoCreateClassModal;
