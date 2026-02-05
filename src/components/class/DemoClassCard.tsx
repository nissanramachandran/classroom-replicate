import React from 'react';
import { MoreVertical, FolderOpen, Users } from 'lucide-react';
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
    class_code?: string;
    owner?: {
      id: string;
      full_name: string;
      email: string;
      avatar_url: any;
      role: 'teacher';
    };
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
      className="gc-class-card bg-card overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-[1.02]"
      onClick={onClick}
    >
      {/* Banner */}
      <div 
        className="relative h-24 p-4"
        style={{ backgroundColor: classData.banner_color || '#1967d2' }}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <circle cx="80" cy="20" r="30" fill="white" />
            <circle cx="90" cy="80" r="20" fill="white" />
          </svg>
        </div>

        {/* Three dot menu */}
        <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
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
              <DropdownMenuItem className="gc-dropdown-item">
                Copy class code
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
        <div className="absolute bottom-4 left-4 right-16">
          <h3 className="text-xl font-google-sans text-white truncate group-hover:underline transition-all">
            {classData.title}
          </h3>
          {classData.section && (
            <p className="text-white/90 text-sm truncate">{classData.section}</p>
          )}
        </div>

        {/* Teacher avatar */}
        <div className="absolute -bottom-6 right-4 transition-transform group-hover:scale-110">
          <div className="gc-avatar gc-avatar-lg border-2 border-card bg-primary text-white shadow-md">
            {getInitials(classData.owner?.full_name || MOCK_USER.full_name)}
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="h-20 border-b border-border px-4 pt-2">
        {classData.owner && (
          <p className="text-sm text-on-surface-variant truncate">
            {classData.owner.full_name}
          </p>
        )}
        {classData.subject && (
          <p className="text-xs text-on-surface-variant/70 truncate mt-1">
            {classData.subject}
          </p>
        )}
        {classData.class_code && (
          <div className="mt-2 flex items-center gap-1">
            <span className="text-xs text-on-surface-variant/60">Code:</span>
            <span className="text-xs font-medium text-primary">{classData.class_code}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="h-14 px-4 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-on-surface-variant">
          <Users className="w-4 h-4" />
          <span>25 students</span>
        </div>
        <button 
          className="gc-btn-icon transition-transform hover:scale-110"
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
