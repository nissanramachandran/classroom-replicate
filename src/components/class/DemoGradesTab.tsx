import React from 'react';
import { format } from 'date-fns';
import { ChevronDown } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MOCK_SUBMISSIONS } from '@/data/mockData';

interface DemoGradesTabProps {
  assignments: any[];
  students: any[];
  isTeacher: boolean;
}

const DemoGradesTab: React.FC<DemoGradesTabProps> = ({ assignments, students, isTeacher }) => {
  // Create grade matrix
  const getGrade = (studentId: string, assignmentId: string) => {
    const submission = MOCK_SUBMISSIONS.find(
      s => s.student_id === studentId && s.assignment_id === assignmentId
    );
    
    if (!submission) return { status: 'not_assigned', grade: null };
    if (submission.status === 'submitted' && submission.grade) {
      return { status: 'graded', grade: submission.grade.grade };
    }
    if (submission.status === 'submitted') {
      return { status: 'submitted', grade: null };
    }
    return { status: 'assigned', grade: null };
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!isTeacher) {
    // Student view - show their own grades
    return (
      <div className="max-w-3xl mx-auto">
        <div className="gc-card overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-google-sans text-lg text-foreground">Your Grades</h2>
          </div>
          
          {assignments.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-on-surface-variant">No assignments to grade yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {assignments.map((assignment) => {
                const gradeInfo = getGrade('s1', assignment.id);
                return (
                  <div key={assignment.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{assignment.title}</p>
                      <p className="text-sm text-on-surface-variant">
                        {assignment.due_date 
                          ? `Due ${format(new Date(assignment.due_date), 'MMM d, h:mm a')}`
                          : 'No due date'}
                      </p>
                    </div>
                    <div className="text-right">
                      {gradeInfo.status === 'graded' ? (
                        <span className="text-lg font-medium text-foreground">
                          {gradeInfo.grade}/{assignment.points || 100}
                        </span>
                      ) : gradeInfo.status === 'submitted' ? (
                        <span className="gc-chip bg-blue-100 text-blue-800">Turned in</span>
                      ) : (
                        <span className="gc-chip">Not submitted</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Teacher view - grade matrix
  return (
    <div className="max-w-full overflow-x-auto">
      <div className="gc-card overflow-hidden min-w-[600px]">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-variant">
              <TableHead className="font-google-sans text-foreground sticky left-0 bg-surface-variant z-10 min-w-[200px]">
                <div className="flex items-center gap-2">
                  Student
                  <ChevronDown className="w-4 h-4 text-on-surface-variant" />
                </div>
              </TableHead>
              {assignments.map((assignment) => (
                <TableHead 
                  key={assignment.id} 
                  className="font-google-sans text-foreground text-center min-w-[120px]"
                >
                  <div className="space-y-1">
                    <p className="truncate max-w-[100px]" title={assignment.title}>
                      {assignment.title}
                    </p>
                    <p className="text-xs font-normal text-on-surface-variant">
                      {assignment.points || 100} pts
                    </p>
                  </div>
                </TableHead>
              ))}
              <TableHead className="font-google-sans text-foreground text-center min-w-[100px]">
                Overall
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => {
              const studentGrades = assignments.map(a => getGrade(student.id, a.id));
              const gradedAssignments = studentGrades.filter(g => g.status === 'graded');
              const totalPoints = gradedAssignments.reduce((sum, g) => sum + (g.grade || 0), 0);
              const maxPoints = gradedAssignments.length * 100;
              const overallGrade = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : null;

              return (
                <TableRow key={student.id} className="hover:bg-surface-variant/50">
                  <TableCell className="sticky left-0 bg-card z-10">
                    <div className="flex items-center gap-3">
                      <div 
                        className="gc-avatar gc-avatar-sm"
                        style={{ 
                          backgroundColor: `hsl(${student.id.charCodeAt(1) * 30}, 70%, 50%)` 
                        }}
                      >
                        {getInitials(student.full_name)}
                      </div>
                      <span className="font-medium text-foreground">{student.full_name}</span>
                    </div>
                  </TableCell>
                  {assignments.map((assignment) => {
                    const gradeInfo = getGrade(student.id, assignment.id);
                    return (
                      <TableCell key={assignment.id} className="text-center">
                        {gradeInfo.status === 'graded' ? (
                          <span className="font-medium text-foreground">
                            {gradeInfo.grade}
                          </span>
                        ) : gradeInfo.status === 'submitted' ? (
                          <span className="text-sm text-blue-600">Turned in</span>
                        ) : gradeInfo.status === 'assigned' ? (
                          <span className="text-sm text-on-surface-variant">—</span>
                        ) : (
                          <span className="text-sm text-on-surface-variant">—</span>
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-center">
                    {overallGrade !== null ? (
                      <span className={`font-medium ${overallGrade >= 70 ? 'text-green-600' : 'text-amber-600'}`}>
                        {overallGrade}%
                      </span>
                    ) : (
                      <span className="text-on-surface-variant">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DemoGradesTab;
