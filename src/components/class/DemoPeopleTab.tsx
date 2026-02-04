import React from 'react';
import { UserPlus, MoreVertical, Mail } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DemoPeopleTabProps {
  teacher: any;
  students: any[];
  isTeacher: boolean;
}

const DemoPeopleTab: React.FC<DemoPeopleTabProps> = ({ teacher, students, isTeacher }) => {
  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Teachers Section */}
      <section>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-primary">
          <h2 className="text-2xl font-google-sans text-primary">Teachers</h2>
          {isTeacher && (
            <button className="gc-btn-icon text-primary">
              <UserPlus className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-surface-variant transition-colors">
            <div className="gc-avatar bg-primary text-white">
              {getInitials(teacher.full_name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">{teacher.full_name}</p>
              <p className="text-sm text-on-surface-variant truncate">{teacher.email}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="gc-btn-icon">
                  <MoreVertical className="w-5 h-5 text-on-surface-variant" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="gc-dropdown">
                <DropdownMenuItem className="gc-dropdown-item">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </section>

      {/* Students Section */}
      <section>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-primary">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-google-sans text-primary">Students</h2>
            <span className="text-on-surface-variant">({students.length})</span>
          </div>
          {isTeacher && (
            <button className="gc-btn-icon text-primary">
              <UserPlus className="w-5 h-5" />
            </button>
          )}
        </div>

        {students.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-on-surface-variant">No students in this class yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {students.map((student) => (
              <div 
                key={student.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-surface-variant transition-colors"
              >
                <div 
                  className="gc-avatar"
                  style={{ 
                    backgroundColor: `hsl(${student.id.charCodeAt(1) * 30}, 70%, 50%)` 
                  }}
                >
                  {getInitials(student.full_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{student.full_name}</p>
                  <p className="text-sm text-on-surface-variant truncate">{student.email}</p>
                </div>
                {isTeacher && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="gc-btn-icon">
                        <MoreVertical className="w-5 h-5 text-on-surface-variant" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="gc-dropdown">
                      <DropdownMenuItem className="gc-dropdown-item">
                        <Mail className="w-4 h-4 mr-2" />
                        Email student
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gc-dropdown-item text-destructive">
                        Remove from class
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default DemoPeopleTab;
