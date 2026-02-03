import React, { useState } from 'react';
import { useClassroom } from '@/contexts/ClassroomContext';
import { formatDistanceToNow, format } from 'date-fns';
import { FileText, Plus, ChevronDown, ChevronRight, MoreVertical, BookOpen, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import CreateAssignmentModal from '@/components/modals/CreateAssignmentModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface ClassworkTabProps {
  classId: string;
  isTeacher: boolean;
}

const ClassworkTab: React.FC<ClassworkTabProps> = ({ classId, isTeacher }) => {
  const { assignments, materials, deleteAssignment } = useClassroom();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set(['No topic']));

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this assignment?')) return;
    
    const { error } = await deleteAssignment(id);
    if (error) {
      toast.error('Failed to delete assignment');
    } else {
      toast.success('Assignment deleted');
    }
  };

  // Group assignments by topic
  const groupedAssignments = assignments.reduce((acc, assignment) => {
    const topic = assignment.topic || 'No topic';
    if (!acc[topic]) acc[topic] = [];
    acc[topic].push(assignment);
    return acc;
  }, {} as Record<string, typeof assignments>);

  const toggleTopic = (topic: string) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topic)) {
      newExpanded.delete(topic);
    } else {
      newExpanded.add(topic);
    }
    setExpandedTopics(newExpanded);
  };

  const formatDueDate = (date: string | null) => {
    if (!date) return 'No due date';
    const dueDate = new Date(date);
    const now = new Date();
    if (dueDate < now) {
      return `Past due ${format(dueDate, 'MMM d')}`;
    }
    return `Due ${format(dueDate, 'MMM d, h:mm a')}`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Create button for teachers */}
      {isTeacher && (
        <div className="mb-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="gc-btn-primary px-4 py-3 shadow-gc-2">
                <Plus className="w-5 h-5 mr-2" />
                Create
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="gc-dropdown">
              <DropdownMenuItem 
                onClick={() => setCreateModalOpen(true)}
                className="gc-dropdown-item"
              >
                <ClipboardList className="w-5 h-5 mr-3" />
                Assignment
              </DropdownMenuItem>
              <DropdownMenuItem className="gc-dropdown-item">
                <FileText className="w-5 h-5 mr-3" />
                Quiz assignment
              </DropdownMenuItem>
              <DropdownMenuItem className="gc-dropdown-item">
                <BookOpen className="w-5 h-5 mr-3" />
                Material
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Assignments grouped by topic */}
      {Object.keys(groupedAssignments).length === 0 ? (
        <div className="text-center py-12">
          <ClipboardList className="w-12 h-12 text-on-surface-variant mx-auto mb-4 opacity-50" />
          <p className="text-on-surface-variant">
            No classwork yet. {isTeacher && 'Create your first assignment!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedAssignments).map(([topic, topicAssignments]) => (
            <div key={topic} className="gc-card overflow-hidden">
              {/* Topic header */}
              <button
                onClick={() => toggleTopic(topic)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-variant transition-colors"
              >
                {expandedTopics.has(topic) ? (
                  <ChevronDown className="w-5 h-5 text-on-surface-variant" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-on-surface-variant" />
                )}
                <span className="font-google-sans text-primary text-lg">{topic}</span>
              </button>

              {/* Assignments in topic */}
              {expandedTopics.has(topic) && (
                <div className="border-t border-border">
                  {topicAssignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="gc-assignment-card"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <ClipboardList className="w-5 h-5 text-primary-foreground" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {assignment.title}
                        </p>
                        <p className="text-sm text-on-surface-variant">
                          Posted {formatDistanceToNow(new Date(assignment.created_at), { addSuffix: true })}
                          {assignment.due_date && ` • ${formatDueDate(assignment.due_date)}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {assignment.points && (
                          <span className="text-sm text-on-surface-variant">
                            {assignment.points} pts
                          </span>
                        )}
                        
                        {isTeacher && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="gc-btn-icon">
                                <MoreVertical className="w-5 h-5 text-on-surface-variant" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="gc-dropdown">
                              <DropdownMenuItem className="gc-dropdown-item">
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(assignment.id)}
                                className="gc-dropdown-item text-destructive"
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Assignment Modal */}
      <CreateAssignmentModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        classId={classId}
      />
    </div>
  );
};

export default ClassworkTab;
