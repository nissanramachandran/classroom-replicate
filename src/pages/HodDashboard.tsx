import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DemoHeader from '@/components/layout/DemoHeader';
import DemoSidebar from '@/components/layout/DemoSidebar';
import { MOCK_CLASSES } from '@/data/mockData';
import { Users, GraduationCap, BookOpen, MessageSquare, Shield } from 'lucide-react';

interface Stats {
  students: number;
  staff: number;
  hods: number;
  classes: number;
  messages: number;
}

const HodDashboard: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<Stats>({ students: 0, staff: 0, hods: 0, classes: 0, messages: 0 });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [{ count: students }, { count: staff }, { count: hods }, { count: classes }, { count: messages }] =
        await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'staff'),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'hod'),
          supabase.from('classes').select('*', { count: 'exact', head: true }),
          supabase.from('chat_messages').select('*', { count: 'exact', head: true }),
        ]);
      setStats({
        students: students || 0,
        staff: staff || 0,
        hods: hods || 0,
        classes: classes || 0,
        messages: messages || 0,
      });

      const { data } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, role, department, created_at')
        .order('created_at', { ascending: false })
        .limit(8);
      setRecentUsers(data || []);
    })();
  }, []);

  const cards = [
    { label: 'Students', value: stats.students, icon: Users, color: 'bg-primary/10 text-primary' },
    { label: 'Staff', value: stats.staff, icon: GraduationCap, color: 'bg-gc-green/10 text-gc-green' },
    { label: 'HODs', value: stats.hods, icon: Shield, color: 'bg-gc-purple/10 text-gc-purple' },
    { label: 'Classes', value: stats.classes, icon: BookOpen, color: 'bg-amber-500/10 text-amber-600' },
    { label: 'Messages', value: stats.messages, icon: MessageSquare, color: 'bg-pink-500/10 text-pink-600' },
  ];

  return (
    <div className="min-h-screen bg-surface-container">
      <DemoHeader
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onCreateClick={() => {}}
        onJoinClick={() => {}}
      />
      <DemoSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        classes={MOCK_CLASSES}
      />

      <main className="lg:ml-72 pt-16 p-6 lg:p-10">
        <div className="max-w-7xl mx-auto animate-fade-in">
          <div className="mb-8">
            <h1 className="text-3xl font-google-sans text-foreground">
              HOD / Admin Dashboard
            </h1>
            <p className="text-on-surface-variant mt-1">
              Welcome{profile?.full_name ? `, ${profile.full_name}` : ''}. Department oversight and platform stats.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
            {cards.map((c) => (
              <div key={c.label} className="gc-card p-5">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${c.color}`}>
                  <c.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-google-sans text-foreground">{c.value}</p>
                <p className="text-sm text-on-surface-variant">{c.label}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="gc-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-google-sans text-lg text-foreground">Recent users</h2>
                <button
                  onClick={() => navigate('/chat')}
                  className="text-sm text-primary hover:underline"
                >
                  Message users →
                </button>
              </div>
              <div className="divide-y divide-border">
                {recentUsers.length === 0 ? (
                  <p className="text-sm text-on-surface-variant py-4">No users yet.</p>
                ) : (
                  recentUsers.map((u) => (
                    <div key={u.user_id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {u.full_name || u.email?.split('@')[0]}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {u.email} · {u.department || '—'}
                        </p>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-surface-container text-on-surface-variant">
                        {u.role || 'user'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="gc-card p-6">
              <h2 className="font-google-sans text-lg text-foreground mb-4">Quick actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="p-4 rounded-xl bg-primary/5 hover:bg-primary/10 text-left transition-colors"
                >
                  <BookOpen className="w-5 h-5 text-primary mb-2" />
                  <p className="text-sm font-medium text-foreground">Classes</p>
                  <p className="text-xs text-on-surface-variant">View all classes</p>
                </button>
                <button
                  onClick={() => navigate('/chat')}
                  className="p-4 rounded-xl bg-gc-green/5 hover:bg-gc-green/10 text-left transition-colors"
                >
                  <MessageSquare className="w-5 h-5 text-gc-green mb-2" />
                  <p className="text-sm font-medium text-foreground">Chat</p>
                  <p className="text-xs text-on-surface-variant">Real-time messaging</p>
                </button>
                <button
                  onClick={() => navigate('/ai')}
                  className="p-4 rounded-xl bg-gc-purple/5 hover:bg-gc-purple/10 text-left transition-colors"
                >
                  <Shield className="w-5 h-5 text-gc-purple mb-2" />
                  <p className="text-sm font-medium text-foreground">AI Center</p>
                  <p className="text-xs text-on-surface-variant">AI tools</p>
                </button>
                <button
                  onClick={() => navigate('/settings')}
                  className="p-4 rounded-xl bg-amber-500/5 hover:bg-amber-500/10 text-left transition-colors"
                >
                  <Users className="w-5 h-5 text-amber-600 mb-2" />
                  <p className="text-sm font-medium text-foreground">Settings</p>
                  <p className="text-xs text-on-surface-variant">Account</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HodDashboard;
