import React from 'react';
import { MoreVertical, FolderOpen } from 'lucide-react';
import { Class } from '@/types/classroom';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ClassCardProps {
  classData: Class;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const ClassCard: React.FC<ClassCardProps> = ({ classData, onClick, onEdit, onDelete }) => {
  const { user } = useAuth();
  const isOwner = user?.id === classData.owner_id;

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="gc-class-card bg-card" onClick={onClick}>
      {/* Banner */}
      <div 
        className="relative h-24 p-4"
        style={{ backgroundColor: classData.banner_color }}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0 pr-8">
            <h3 className="text-xl font-google-sans text-white font-medium truncate hover:underline cursor-pointer">
              {classData.title}
            </h3>
            {classData.section && (
              <p className="text-sm text-white/80 truncate mt-0.5">
                {classData.section}
              </p>
            )}
            {classData.owner && (
              <p className="text-sm text-white/80 truncate mt-1">
                {classData.owner.full_name}
              </p>
            )}
          </div>
          
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <button className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="gc-dropdown">
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
                  className="gc-dropdown-item"
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                  className="gc-dropdown-item text-destructive"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Teacher avatar */}
        <div className="absolute right-4 -bottom-8">
          {classData.owner?.avatar_url ? (
            <img 
              src={classData.owner.avatar_url}
              alt={classData.owner.full_name || 'Teacher'}
              className="w-16 h-16 rounded-full border-2 border-white"
            />
          ) : (
            <div 
              className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center text-white text-xl font-medium"
              style={{ backgroundColor: classData.banner_color }}
            >
              {getInitials(classData.owner?.full_name)}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="h-24 p-4 border-b border-border">
        {/* Can show upcoming assignments here */}
      </div>

      {/* Footer */}
      <div className="h-12 px-4 flex items-center justify-end border-t border-border">
        <button 
          className="gc-btn-icon"
          onClick={(e) => { e.stopPropagation(); }}
          aria-label="Open folder"
        >
          <FolderOpen className="w-5 h-5 text-on-surface-variant" />
        </button>
      </div>
    </div>
  );
};

export default ClassCard;
