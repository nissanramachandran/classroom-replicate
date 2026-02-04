import React, { useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  FileText, 
  Plus, 
  ChevronDown, 
  ChevronRight, 
  MoreVertical, 
  BookOpen, 
  ClipboardList,
  Download,
  Eye,
  FileImage,
  FileVideo,
  File,
  Presentation,
  FileSpreadsheet
} from 'lucide-react';
import { toast } from 'sonner';
import DemoCreateAssignmentModal from '@/components/modals/DemoCreateAssignmentModal';
import UploadMaterialModal from '@/components/modals/UploadMaterialModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { getFileTypeConfig, formatFileSize } from '@/data/mockData';

interface TopicGroup {
  assignments: any[];
  materials: any[];
}

interface DemoClassworkTabProps {
  classId: string;
  assignments: any[];
  materials: any[];
  isTeacher: boolean;
}

const FileTypeIcon: React.FC<{ fileType: string; className?: string }> = ({ fileType, className }) => {
  const type = fileType?.toLowerCase() || '';
  
  if (type.includes('pdf')) {
    return <FileText className={cn("text-red-500", className)} />;
  }
  if (type.includes('doc')) {
    return <FileText className={cn("text-blue-500", className)} />;
  }
  if (type.includes('ppt') || type.includes('presentation')) {
    return <Presentation className={cn("text-orange-500", className)} />;
  }
  if (type.includes('xls') || type.includes('sheet')) {
    return <FileSpreadsheet className={cn("text-green-500", className)} />;
  }
  if (type.includes('image') || type.includes('jpg') || type.includes('png') || type.includes('gif')) {
    return <FileImage className={cn("text-yellow-500", className)} />;
  }
  if (type.includes('video') || type.includes('mp4') || type.includes('mov')) {
    return <FileVideo className={cn("text-purple-500", className)} />;
  }
  return <File className={cn("text-gray-500", className)} />;
};

const DemoClassworkTab: React.FC<DemoClassworkTabProps> = ({ 
  classId, 
  assignments: initialAssignments, 
  materials: initialMaterials,
  isTeacher 
}) => {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [materials] = useState(initialMaterials);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set(['Algebra', 'Calculus', 'No topic', 'Programming Basics', 'Lab Work', 'Shakespeare']));

  const handleDeleteAssignment = (id: string) => {
    if (!confirm('Delete this assignment?')) return;
    setAssignments(prev => prev.filter(a => a.id !== id));
    toast.success('Assignment deleted');
  };

  // Group assignments by topic
  const groupedAssignments = assignments.reduce<Record<string, TopicGroup>>((acc, assignment) => {
    const topic = assignment.topic || 'No topic';
    if (!acc[topic]) acc[topic] = { assignments: [], materials: [] };
    acc[topic].assignments.push(assignment);
    return acc;
  }, {} as Record<string, { assignments: any[]; materials: any[] }>);

  // Group materials by topic
  materials.forEach(material => {
    const topic = material.topic || 'No topic';
    if (!groupedAssignments[topic]) {
      groupedAssignments[topic] = { assignments: [], materials: [] };
    }
    groupedAssignments[topic].materials.push(material);
  });

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

  const handleAddAssignment = (data: any) => {
    const newAssignment = {
      id: `assign-${Date.now()}`,
      class_id: classId,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setAssignments(prev => [...prev, newAssignment]);
    toast.success('Assignment created');
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
              <DropdownMenuItem 
                onClick={() => setUploadModalOpen(true)}
                className="gc-dropdown-item"
              >
                <BookOpen className="w-5 h-5 mr-3" />
                Material
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Topics with assignments and materials */}
      {Object.keys(groupedAssignments).length === 0 ? (
        <div className="text-center py-12">
          <ClipboardList className="w-12 h-12 text-on-surface-variant mx-auto mb-4 opacity-50" />
          <p className="text-on-surface-variant">
            No classwork yet. {isTeacher && 'Create your first assignment!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedAssignments).map(([topic, items]) => (
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
                <span className="text-sm text-on-surface-variant ml-2">
                  ({items.assignments.length + items.materials.length} items)
                </span>
              </button>

              {/* Items in topic */}
              {expandedTopics.has(topic) && (
                <div className="border-t border-border">
                  {/* Materials */}
                  {items.materials.map((material) => (
                    <div key={material.id} className="border-b border-border last:border-b-0">
                      <div className="gc-assignment-card">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                          <BookOpen className="w-5 h-5 text-secondary-foreground" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {material.title}
                          </p>
                          <p className="text-sm text-on-surface-variant">
                            Posted {formatDistanceToNow(new Date(material.created_at), { addSuffix: true })}
                          </p>
                        </div>

                        {isTeacher && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="gc-btn-icon">
                                <MoreVertical className="w-5 h-5 text-on-surface-variant" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="gc-dropdown">
                              <DropdownMenuItem className="gc-dropdown-item">Edit</DropdownMenuItem>
                              <DropdownMenuItem className="gc-dropdown-item text-destructive">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>

                      {/* Attachments */}
                      {material.attachments && material.attachments.length > 0 && (
                        <div className="px-4 pb-4 pl-[68px]">
                          <div className="grid gap-2">
                            {material.attachments.map((attachment: any) => (
                              <div 
                                key={attachment.id}
                                className="flex items-center gap-3 p-3 bg-surface-variant rounded-lg hover:bg-surface-variant/80 transition-colors"
                              >
                                <FileTypeIcon fileType={attachment.file_type} className="w-6 h-6" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground truncate">
                                    {attachment.name}
                                  </p>
                                  <p className="text-xs text-on-surface-variant">
                                    {getFileTypeConfig(attachment.file_type).label}
                                    {attachment.file_size && ` • ${formatFileSize(attachment.file_size)}`}
                                  </p>
                                </div>
                                <div className="flex gap-1">
                                  <button 
                                    className="gc-btn-icon"
                                    title="Preview"
                                    onClick={() => toast.info('Preview not available in demo')}
                                  >
                                    <Eye className="w-4 h-4 text-on-surface-variant" />
                                  </button>
                                  <button 
                                    className="gc-btn-icon"
                                    title="Download"
                                    onClick={() => toast.info('Download not available in demo')}
                                  >
                                    <Download className="w-4 h-4 text-on-surface-variant" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Assignments */}
                  {items.assignments.map((assignment) => (
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
                                onClick={() => handleDeleteAssignment(assignment.id)}
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
      <DemoCreateAssignmentModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        classId={classId}
        onSubmit={handleAddAssignment}
      />

      {/* Upload Material Modal */}
      <UploadMaterialModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      />
    </div>
  );
};

export default DemoClassworkTab;
