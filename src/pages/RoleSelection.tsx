import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppRole } from '@/types/classroom';
import { toast } from 'sonner';
import { GraduationCap, Users, Loader2 } from 'lucide-react';

const RoleSelection: React.FC = () => {
  const { profile, setUserRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState<AppRole | null>(null);

  const handleRoleSelect = async (role: AppRole) => {
    setLoading(role);
    const { error } = await setUserRole(role);
    
    if (error) {
      toast.error('Failed to set role. Please try again.');
      setLoading(null);
    } else {
      toast.success(`Welcome${role === 'teacher' ? ', Teacher' : ''}!`);
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-6">
            <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none">
              <rect width="24" height="24" rx="4" fill="#1967d2"/>
              <path d="M12 12c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm0 1.5c-2 0-6 1-6 3v1.5h12v-1.5c0-2-4-3-6-3z" fill="white"/>
            </svg>
            <span className="text-2xl font-google-sans text-foreground">Classroom</span>
          </div>
          <h1 className="text-2xl font-google-sans text-foreground mb-2">
            Welcome, {profile?.full_name || 'there'}!
          </h1>
          <p className="text-on-surface-variant">
            Choose how you'll use Classroom
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Teacher Card */}
          <button
            onClick={() => handleRoleSelect('teacher')}
            disabled={loading !== null}
            className="gc-card p-8 text-left hover:shadow-gc-3 transition-all group disabled:opacity-60"
          >
            <div className="w-16 h-16 rounded-full bg-gc-green/10 flex items-center justify-center mb-6 group-hover:bg-gc-green/20 transition-colors">
              {loading === 'teacher' ? (
                <Loader2 className="w-8 h-8 text-gc-green animate-spin" />
              ) : (
                <GraduationCap className="w-8 h-8 text-gc-green" />
              )}
            </div>
            <h2 className="text-xl font-google-sans text-foreground mb-2">
              I'm a Teacher
            </h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Create and manage classes, post announcements, create assignments, and grade student work.
            </p>
          </button>

          {/* Student Card */}
          <button
            onClick={() => handleRoleSelect('student')}
            disabled={loading !== null}
            className="gc-card p-8 text-left hover:shadow-gc-3 transition-all group disabled:opacity-60"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
              {loading === 'student' ? (
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              ) : (
                <Users className="w-8 h-8 text-primary" />
              )}
            </div>
            <h2 className="text-xl font-google-sans text-foreground mb-2">
              I'm a Student
            </h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Join classes, view announcements, submit assignments, and track your grades.
            </p>
          </button>
        </div>

        <p className="text-center text-xs text-on-surface-variant mt-8">
          You can change this later in your settings
        </p>
      </div>
    </div>
  );
};

export default RoleSelection;
