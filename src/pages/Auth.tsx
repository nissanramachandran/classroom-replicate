import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, User, Eye, EyeOff, GraduationCap, Users, Building2 } from 'lucide-react';
import { DEPARTMENTS, type Department } from '@/types/classroom';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type LoginMode = 'staff' | 'student';
type AuthMode = 'login' | 'signup';

const Auth: React.FC = () => {
  const [loginMode, setLoginMode] = useState<LoginMode>('staff');
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState<Department | ''>('');
  const [staffId, setStaffId] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shakeError, setShakeError] = useState(false);
  
  const { signIn, signUp, signInWithGoogle, user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (user && profile?.role) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } else if (user && !profile?.role) {
      navigate('/select-role', { replace: true });
    }
  }, [user, profile, navigate, location]);

  const triggerShakeError = () => {
    setShakeError(true);
    setTimeout(() => setShakeError(false), 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!department) {
      toast.error('Please select a department');
      triggerShakeError();
      return;
    }

    setLoading(true);

    try {
      const emailToUse = loginMode === 'staff' 
        ? (staffId.includes('@') ? staffId : `${staffId}@staff.edu`)
        : `${registerNumber}@student.edu`;

      if (authMode === 'login') {
        const { error } = await signIn(email || emailToUse, password);
        if (error) {
          toast.error(error.message);
          triggerShakeError();
        }
      } else {
        if (!fullName.trim()) {
          toast.error('Please enter your name');
          triggerShakeError();
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('This email is already registered. Please sign in.');
          } else {
            toast.error(error.message);
          }
          triggerShakeError();
        } else {
          toast.success('Check your email to confirm your account!');
        }
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
      triggerShakeError();
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error(error.message);
      }
    } catch (err) {
      toast.error('Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoMode = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex bg-surface-container">
      {/* Left side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/70">
        {/* Animated background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 -right-32 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
          <div className="mb-8">
            <svg viewBox="0 0 24 24" className="w-24 h-24" fill="none">
              <rect width="24" height="24" rx="4" fill="white"/>
              <path d="M12 12c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm0 1.5c-2 0-6 1-6 3v1.5h12v-1.5c0-2-4-3-6-3z" fill="#1967d2"/>
            </svg>
          </div>
          
          <h1 className="text-4xl font-google-sans font-bold mb-4 text-center">
            Welcome to Classroom
          </h1>
          <p className="text-xl text-white/80 text-center max-w-md">
            A modern learning management platform for educators and students
          </p>
          
          {/* Feature highlights */}
          <div className="mt-12 space-y-4 max-w-sm">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium">Easy Class Management</h3>
                <p className="text-sm text-white/70">Create and organize classes effortlessly</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium">Collaborate Seamlessly</h3>
                <p className="text-sm text-white/70">Connect teachers and students</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div 
          className={cn(
            "w-full max-w-md animate-fade-in",
            shakeError && "animate-shake"
          )}
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none">
                <rect width="24" height="24" rx="4" fill="#1967d2"/>
                <path d="M12 12c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm0 1.5c-2 0-6 1-6 3v1.5h12v-1.5c0-2-4-3-6-3z" fill="white"/>
              </svg>
              <span className="text-2xl font-google-sans text-foreground">Classroom</span>
            </div>
          </div>

          {/* Glass card */}
          <div className="gc-card p-8 backdrop-blur-xl bg-card/80 shadow-2xl border border-border/50">
            <h2 className="text-2xl font-google-sans text-foreground text-center mb-2">
              {authMode === 'login' ? 'Sign in' : 'Create account'}
            </h2>
            <p className="text-sm text-on-surface-variant text-center mb-6">
              {authMode === 'login' ? 'Access your classroom' : 'Join the learning community'}
            </p>

            {/* Role toggle */}
            <div className="flex p-1 bg-surface-container rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setLoginMode('staff')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-300",
                  loginMode === 'staff'
                    ? "bg-primary text-white shadow-lg"
                    : "text-on-surface-variant hover:bg-surface-container-high"
                )}
              >
                <GraduationCap className="w-5 h-5" />
                Staff
              </button>
              <button
                type="button"
                onClick={() => setLoginMode('student')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-300",
                  loginMode === 'student'
                    ? "bg-gc-green text-white shadow-lg"
                    : "text-on-surface-variant hover:bg-surface-container-high"
                )}
              >
                <Users className="w-5 h-5" />
                Student
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Department selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Department</label>
                <Select value={department} onValueChange={(value) => setDepartment(value as Department)}>
                  <SelectTrigger className="gc-input">
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
              </div>

              {authMode === 'signup' && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                  <Input
                    type="text"
                    placeholder="Full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="gc-input pl-10"
                    required
                  />
                </div>
              )}

              {/* Staff ID / Register Number based on mode */}
              {loginMode === 'staff' ? (
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                  <Input
                    type="text"
                    placeholder="Staff ID or Email"
                    value={staffId || email}
                    onChange={(e) => {
                      if (e.target.value.includes('@')) {
                        setEmail(e.target.value);
                        setStaffId('');
                      } else {
                        setStaffId(e.target.value);
                        setEmail('');
                      }
                    }}
                    className="gc-input pl-10"
                    required
                  />
                </div>
              ) : (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                  <Input
                    type="text"
                    placeholder="Register Number"
                    value={registerNumber}
                    onChange={(e) => setRegisterNumber(e.target.value)}
                    className="gc-input pl-10"
                    required
                  />
                </div>
              )}

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="gc-input pl-10 pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full h-12 font-medium transition-all duration-300",
                  loginMode === 'staff' 
                    ? "bg-primary hover:bg-primary/90" 
                    : "bg-gc-green hover:bg-gc-green/90"
                )}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  authMode === 'login' ? 'Sign in' : 'Sign up'
                )}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full h-12 font-google-sans hover:bg-surface-container-high transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <p className="text-center text-sm text-on-surface-variant mt-6">
              {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="text-primary hover:underline font-medium"
              >
                {authMode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>

            {/* Demo mode link */}
            <div className="mt-4 pt-4 border-t border-border">
              <button
                type="button"
                onClick={handleDemoMode}
                className="w-full text-center text-sm text-on-surface-variant hover:text-foreground transition-colors"
              >
                Try Demo Mode →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
