import React, { useEffect, useState } from 'react';
import { useClassroom } from '@/contexts/ClassroomContext';
import { useAuth } from '@/contexts/AuthContext';
import { Assignment, Submission } from '@/types/classroom';
import { format } from 'date-fns';
import { ClipboardList, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface GradesTabProps {
  classId: string;
  isTeacher: boolean;
}

interface GradeRow {
  assignment: Assignment;
  submission?: Submission;
}

const GradesTab: React.FC<GradesTabProps> = ({ classId, isTeacher }) => {
  const { assignments, getSubmissions, members } = useClassroom();
  const { user } = useAuth();
  const [studentGrades, setStudentGrades] = useState<GradeRow[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<Map<string, Submission[]>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGrades = async () => {
      setLoading(true);
      
      if (isTeacher) {
        // For teachers, load all submissions for each assignment
        const submissionsMap = new Map<string, Submission[]>();
        for (const assignment of assignments) {
          const subs = await getSubmissions(assignment.id);
          submissionsMap.set(assignment.id, subs);
        }
        setAllSubmissions(submissionsMap);
      } else {
        // For students, load their own submissions
        const grades: GradeRow[] = [];
        for (const assignment of assignments) {
          const submissions = await getSubmissions(assignment.id);
          const mySubmission = submissions.find(s => s.student_id === user?.id);
          grades.push({ assignment, submission: mySubmission });
        }
        setStudentGrades(grades);
      }
      
      setLoading(false);
    };

    if (assignments.length > 0) {
      loadGrades();
    } else {
      setLoading(false);
    }
  }, [assignments, isTeacher, getSubmissions, user?.id]);

  const getStatusIcon = (submission?: Submission) => {
    if (!submission || submission.status === 'assigned') {
      return <Clock className="w-4 h-4 text-warning" />;
    }
    if (submission.status === 'graded' && submission.grade) {
      return <CheckCircle className="w-4 h-4 text-success" />;
    }
    if (submission.status === 'turned_in') {
      return <CheckCircle className="w-4 h-4 text-primary" />;
    }
    return <AlertCircle className="w-4 h-4 text-on-surface-variant" />;
  };

  const getStatusText = (submission?: Submission, assignment?: Assignment) => {
    if (!submission || submission.status === 'assigned') {
      return 'Not submitted';
    }
    if (submission.status === 'graded' && submission.grade !== null) {
      return `${submission.grade?.grade || 0}/${assignment?.points || 100}`;
    }
    if (submission.status === 'turned_in') {
      return 'Turned in';
    }
    return submission.status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="gc-spinner" />
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="text-center py-12">
        <ClipboardList className="w-12 h-12 text-on-surface-variant mx-auto mb-4 opacity-50" />
        <p className="text-on-surface-variant">No assignments to grade yet</p>
      </div>
    );
  }

  // Student view
  if (!isTeacher) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="gc-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-variant">
                <th className="text-left px-4 py-3 text-sm font-medium text-on-surface-variant">
                  Assignment
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-on-surface-variant">
                  Due
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-on-surface-variant">
                  Status
                </th>
                <th className="text-right px-4 py-3 text-sm font-medium text-on-surface-variant">
                  Grade
                </th>
              </tr>
            </thead>
            <tbody>
              {studentGrades.map(({ assignment, submission }) => (
                <tr key={assignment.id} className="border-t border-border hover:bg-surface-variant">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <ClipboardList className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <span className="font-medium text-foreground">{assignment.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-on-surface-variant">
                    {assignment.due_date 
                      ? format(new Date(assignment.due_date), 'MMM d, h:mm a')
                      : 'No due date'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(submission)}
                      <span className="text-sm text-on-surface-variant">
                        {submission?.status === 'graded' ? 'Graded' : 
                         submission?.status === 'turned_in' ? 'Turned in' : 'Assigned'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-medium ${
                      submission?.grade ? 'text-foreground' : 'text-on-surface-variant'
                    }`}>
                      {getStatusText(submission, assignment)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Teacher view - grade matrix
  const students = members.filter(m => m.role === 'student');

  return (
    <div className="max-w-full overflow-x-auto">
      <div className="gc-card overflow-hidden min-w-[600px]">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-variant">
              <th className="text-left px-4 py-3 text-sm font-medium text-on-surface-variant sticky left-0 bg-surface-variant">
                Student
              </th>
              {assignments.map(assignment => (
                <th key={assignment.id} className="text-center px-4 py-3 text-sm font-medium text-on-surface-variant min-w-[100px]">
                  <div className="truncate max-w-[100px]" title={assignment.title}>
                    {assignment.title}
                  </div>
                  <div className="text-xs font-normal">{assignment.points} pts</div>
                </th>
              ))}
              <th className="text-right px-4 py-3 text-sm font-medium text-on-surface-variant">
                Average
              </th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={assignments.length + 2} className="text-center py-8 text-on-surface-variant">
                  No students enrolled yet
                </td>
              </tr>
            ) : (
              students.map(student => {
                const studentSubmissions = assignments.map(a => {
                  const subs = allSubmissions.get(a.id) || [];
                  return subs.find(s => s.student_id === student.user_id);
                });

                const grades = studentSubmissions
                  .map(s => s?.grade?.grade)
                  .filter((g): g is number => g !== null && g !== undefined);
                
                const average = grades.length > 0 
                  ? Math.round(grades.reduce((a, b) => a + b, 0) / grades.length)
                  : null;

                return (
                  <tr key={student.id} className="border-t border-border hover:bg-surface-variant">
                    <td className="px-4 py-3 sticky left-0 bg-card">
                      <span className="font-medium text-foreground">
                        {student.user?.full_name}
                      </span>
                    </td>
                    {assignments.map((assignment, idx) => {
                      const submission = studentSubmissions[idx];
                      return (
                        <td key={assignment.id} className="text-center px-4 py-3">
                          <span className={`font-medium ${
                            submission?.grade?.grade !== undefined ? 'text-foreground' : 'text-on-surface-variant'
                          }`}>
                            {submission?.grade?.grade !== undefined 
                              ? `${submission.grade.grade}` 
                              : submission?.status === 'turned_in' 
                                ? '—'
                                : ''}
                          </span>
                        </td>
                      );
                    })}
                    <td className="text-right px-4 py-3">
                      <span className="font-medium text-foreground">
                        {average !== null ? `${average}%` : '—'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GradesTab;
