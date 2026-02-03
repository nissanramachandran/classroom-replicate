import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface JoinClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (code: string) => Promise<void>;
  loading?: boolean;
}

const JoinClassModal: React.FC<JoinClassModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
}) => {
  const [code, setCode] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(code.trim());
    setCode('');
  };

  return (
    <div className="gc-dialog animate-fade-in">
      <div className="gc-dialog-content animate-scale-in max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-google-sans text-foreground">Join class</h2>
          <button onClick={onClose} className="gc-btn-icon">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-on-surface-variant mb-6">
            Ask your teacher for the class code, then enter it here.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">
                Class code
              </label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Enter code"
                className="gc-input font-mono text-lg tracking-wider"
                maxLength={7}
                required
              />
              <p className="text-xs text-on-surface-variant mt-2">
                Class codes are 7 characters long
              </p>
            </div>

            {/* Info box */}
            <div className="bg-surface-variant rounded-lg p-4">
              <h4 className="text-sm font-medium text-foreground mb-2">
                To sign in with a class code
              </h4>
              <ul className="text-xs text-on-surface-variant space-y-1">
                <li>• Use an authorized account</li>
                <li>• Use a class code with 7 letters or numbers, and no spaces or symbols</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
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
                disabled={code.length !== 7 || loading}
                className="gc-btn-primary"
              >
                {loading ? 'Joining...' : 'Join'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JoinClassModal;
