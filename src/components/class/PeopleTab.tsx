import React, { useEffect, useState } from 'react';
import { useClassroom } from '@/contexts/ClassroomContext';
import { Profile } from '@/types/classroom';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, MoreVertical, Mail } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PeopleTabProps {
  classId: string;
  isTeacher: boolean;
  ownerId: string;
}

const PeopleTab: React.FC<PeopleTabProps> = ({ classId, isTeacher, ownerId }) => {
  const { members, removeMember } = useClassroom();
  const [owner, setOwner] = useState<Profile | null>(null);

  useEffect(() => {
    // Fetch owner profile
    const fetchOwner = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', ownerId)
        .single();
      
      if (data) {
        setOwner(data as Profile);
      }
    };
    
    fetchOwner();
  }, [ownerId]);

  const handleRemove = async (membershipId: string, memberName: string | null) => {
    if (!confirm(`Remove ${memberName || 'this student'} from the class?`)) return;
    
    const { error } = await removeMember(membershipId);
    if (error) {
      toast.error('Failed to remove student');
    } else {
      toast.success('Student removed');
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const teachers = members.filter(m => m.role === 'teacher');
  const students = members.filter(m => m.role === 'student');

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Teachers section */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b-2 border-primary mb-4">
          <h2 className="text-2xl font-google-sans text-primary">Teachers</h2>
          {isTeacher && (
            <button className="gc-btn-icon text-primary">
              <UserPlus className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Owner (main teacher) */}
        {owner && (
          <div className="flex items-center gap-4 py-3">
            {owner.avatar_url ? (
              <img src={owner.avatar_url} alt="" className="w-10 h-10 rounded-full" />
            ) : (
              <div className="gc-avatar">{getInitials(owner.full_name)}</div>
            )}
            <div className="flex-1">
              <p className="font-medium text-foreground">{owner.full_name}</p>
              <p className="text-sm text-on-surface-variant">Class owner</p>
            </div>
            <button className="gc-btn-icon">
              <Mail className="w-5 h-5 text-on-surface-variant" />
            </button>
          </div>
        )}

        {/* Co-teachers */}
        {teachers.map((teacher) => (
          <div key={teacher.id} className="flex items-center gap-4 py-3">
            {teacher.user?.avatar_url ? (
              <img src={teacher.user.avatar_url} alt="" className="w-10 h-10 rounded-full" />
            ) : (
              <div className="gc-avatar">{getInitials(teacher.user?.full_name)}</div>
            )}
            <div className="flex-1">
              <p className="font-medium text-foreground">{teacher.user?.full_name}</p>
            </div>
            <button className="gc-btn-icon">
              <Mail className="w-5 h-5 text-on-surface-variant" />
            </button>
          </div>
        ))}
      </div>

      {/* Students section */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b-2 border-primary mb-4">
          <h2 className="text-2xl font-google-sans text-primary">
            Students
            <span className="ml-2 text-lg text-on-surface-variant font-normal">
              ({students.length})
            </span>
          </h2>
          {isTeacher && (
            <button className="gc-btn-icon text-primary">
              <UserPlus className="w-6 h-6" />
            </button>
          )}
        </div>

        {students.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-on-surface-variant">No students yet</p>
            <p className="text-sm text-on-surface-variant mt-1">
              Share the class code with your students to let them join
            </p>
          </div>
        ) : (
          students.map((student) => (
            <div key={student.id} className="flex items-center gap-4 py-3 hover:bg-surface-variant rounded-lg px-2 -mx-2">
              {student.user?.avatar_url ? (
                <img src={student.user.avatar_url} alt="" className="w-10 h-10 rounded-full" />
              ) : (
                <div className="gc-avatar">{getInitials(student.user?.full_name)}</div>
              )}
              <div className="flex-1">
                <p className="font-medium text-foreground">{student.user?.full_name}</p>
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
                    <DropdownMenuItem 
                      onClick={() => handleRemove(student.id, student.user?.full_name)}
                      className="gc-dropdown-item text-destructive"
                    >
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PeopleTab;
