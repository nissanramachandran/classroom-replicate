import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { Profile, AppRole, Department } from '@/types/classroom';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isStaff: boolean;
  isStudent: boolean;
  isHod: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, role?: AppRole, department?: Department) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  setUserRole: (role: AppRole, department?: Department) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    const profileData = data as Profile;
    if (typeof window !== 'undefined' && profileData.role) {
      localStorage.setItem('demoUserRole', profileData.role);
      if (profileData.department) localStorage.setItem('demoUserDepartment', profileData.department);
    }
    return profileData;
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Defer profile fetch with setTimeout to avoid deadlock
        if (currentSession?.user) {
          setTimeout(() => {
            fetchProfile(currentSession.user.id).then(setProfile);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id).then(setProfile);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, fullName: string, role?: AppRole, department?: Department) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          role,
          department,
        },
      },
    });
    return { error: error as Error | null };
  };

  const signInWithGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin,
      extraParams: { prompt: 'select_account' },
    });
    return { error: result.error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const setUserRole = async (role: AppRole, department?: Department) => {
    if (!user) return { error: new Error('No user logged in') };

    // Update profile with role and department
    const updateData: { role: AppRole; department?: string } = { role };
    if (department) {
      updateData.department = department;
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('user_id', user.id);

    if (profileError) return { error: profileError as Error };

    // Keep legacy class membership policies compatible with staff/HOD users.
    const classRole = role === 'student' ? 'student' : 'teacher';
    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({ user_id: user.id, role: classRole }, { onConflict: 'user_id,role' });

    if (roleError) return { error: roleError as Error };

    await refreshProfile();
    return { error: null };
  };

  // Computed properties for role checks
  const isStaff = profile?.role === 'staff';
  const isStudent = profile?.role === 'student';
  const isHod = profile?.role === 'hod';

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      isStaff,
      isStudent,
      isHod,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      setUserRole,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
