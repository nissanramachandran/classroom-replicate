import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppRole, DEPARTMENTS, type Department } from '@/types/classroom';
import { toast } from 'sonner';
import { GraduationCap, Users, Loader2, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const RoleSelection: React.FC = () => {
  const { profile, user, setUserRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<AppRole | null>(null);
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);
  const [department, setDepartment] = useState<Department | ''>('');
  const [step, setStep] = useState<'role' | 'department'>('role');

  // Redirect if already has role
  useEffect(() => {
    if (profile?.role) {
      navigate('/dashboard', { replace: true });
    }
  }, [profile, navigate]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth', { replace: true });
    }
  }, [user, navigate]);

  const handleRoleSelect = (role: AppRole) => {
    setSelectedRole(role);
    setStep('department');
  };

  const handleConfirm = async () => {
    if (!selectedRole || !department) {
      toast.error('Please select a department');
      return;
    }

    setLoading(selectedRole);
    const { error } = await setUserRole(selectedRole, department);
    
    if (error) {
      toast.error('Failed to set role. Please try again.');
      setLoading(null);
    } else {
      toast.success(`Welcome${selectedRole === 'teacher' ? ', Teacher' : ''}!`);
      navigate('/dashboard');
    }
  };

  const handleBack = () => {
    setStep('role');
    setSelectedRole(null);
    setDepartment('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container p-4">
      <div className="w-full max-w-2xl animate-fade-in">
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
            Welcome, {profile?.full_name || user?.email?.split('@')[0] || 'there'}!
          </h1>
          <p className="text-on-surface-variant">
            {step === 'role' ? 'Choose how you\'ll use Classroom' : 'Select your department'}
          </p>
        </div>

        {step === 'role' ? (
          /* Role Cards */
          <div className="grid md:grid-cols-2 gap-6">
            {/* Teacher Card */}
            <button
              onClick={() => handleRoleSelect('teacher')}
              disabled={loading !== null}
              className="gc-card p-8 text-left hover:shadow-gc-3 transition-all group disabled:opacity-60"
            >
              <div className="w-16 h-16 rounded-full bg-gc-green/10 flex items-center justify-center mb-6 group-hover:bg-gc-green/20 transition-colors">
                <GraduationCap className="w-8 h-8 text-gc-green" />
              </div>
              <h2 className="text-xl font-google-sans text-foreground mb-2">
                I'm a Staff Member
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
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-google-sans text-foreground mb-2">
                I'm a Student
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Join classes, view announcements, view assignments, and track your progress.
              </p>
            </button>
          </div>
        ) : (
          /* Department Selection */
          <div className="gc-card p-8 max-w-md mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                selectedRole === 'teacher' ? "bg-gc-green/10" : "bg-primary/10"
              )}>
                {selectedRole === 'teacher' ? (
                  <GraduationCap className="w-6 h-6 text-gc-green" />
                ) : (
                  <Users className="w-6 h-6 text-primary" />
                )}
              </div>
              <div>
                <h3 className="font-google-sans text-lg text-foreground">
                  {selectedRole === 'teacher' ? 'Staff Member' : 'Student'}
                </h3>
                <p className="text-sm text-on-surface-variant">Select your department</p>
              </div>
            </div>

            <div className="space-y-4">
              <Select value={department} onValueChange={(value) => setDepartment(value as Department)}>
                <SelectTrigger className="gc-input h-12">
                  <Building2 className="w-5 h-5 text-on-surface-variant mr-2" />
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleBack}
                  className="flex-1 gc-btn-secondary h-12"
                  disabled={loading !== null}
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading !== null || !department}
                  className={cn(
                    "flex-1 h-12 rounded-lg font-medium text-white transition-all",
                    selectedRole === 'teacher' 
                      ? "bg-gc-green hover:bg-gc-green/90" 
                      : "bg-primary hover:bg-primary/90",
                    (!department || loading) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    'Continue'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-on-surface-variant mt-8">
          You can change this later in your settings
        </p>
      </div>
    </div>
  );
};

export default RoleSelection;
