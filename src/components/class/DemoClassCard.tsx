import React from 'react';
import { MoreVertical, FolderOpen } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MOCK_USER } from '@/data/mockData';

interface DemoClassCardProps {
  classData: {
    id: string;
    title: string;
    section?: string;
    subject?: string;
    room?: string;
    banner_color?: string;
    owner?: typeof MOCK_USER;
  };
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const DemoClassCard: React.FC<DemoClassCardProps> = ({
  classData,
  onClick,
  onEdit,
  onDelete,
}) => {
  const isOwner = true; // In demo mode, user is always the owner

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div 
      className="gc-card overflow-hidden cursor-pointer group hover:shadow-gc-2 transition-shadow"
      onClick={onClick}
    >
      {/* Banner */}
      <div 
        className="relative h-24 p-4"
        style={{ backgroundColor: classData.banner_color || '#1967d2' }}
      >
        {/* Three dot menu */}
        <div className="absolute top-2 right-2" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-full hover:bg-white/20 transition-colors">
                <MoreVertical className="w-5 h-5 text-white" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="gc-dropdown">
              <DropdownMenuItem onClick={onEdit} className="gc-dropdown-item">
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="gc-dropdown-item">
                Copy link
              </DropdownMenuItem>
              {isOwner && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onDelete} className="gc-dropdown-item text-destructive">
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Class title */}
        <div className="absolute bottom-4 left-4 right-12">
          <h3 className="text-xl font-google-sans text-white truncate group-hover:underline">
            {classData.title}
          </h3>
          {classData.section && (
            <p className="text-white/90 text-sm truncate">{classData.section}</p>
          )}
        </div>

        {/* Teacher avatar */}
        <div className="absolute -bottom-6 right-4">
          <div className="gc-avatar gc-avatar-lg border-2 border-card bg-primary text-white">
            {getInitials(classData.owner?.full_name || MOCK_USER.full_name)}
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="h-20 border-b border-border">
        {classData.owner && (
          <p className="px-4 pt-2 text-sm text-on-surface-variant truncate">
            {classData.owner.full_name}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="h-14 px-4 flex items-center justify-end gap-2">
        <button 
          className="gc-btn-icon"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <FolderOpen className="w-5 h-5 text-on-surface-variant" />
        </button>
      </div>
    </div>
  );
};

export default DemoClassCard;
