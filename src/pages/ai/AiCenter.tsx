// AI Center hub: lists all tools available to the current role
import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { Menu, ScanSearch } from 'lucide-react';
import DemoSidebar from '@/components/layout/DemoSidebar';
import DemoHeader from '@/components/layout/DemoHeader';
import { getDemoUser, MOCK_CLASSES } from '@/data/mockData';
import { AI_TOOLS, getToolsForRole } from '@/lib/aiTools';
import AiHeader from '@/components/ai/AiHeader';
import { cn } from '@/lib/utils';

const AiCenter: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const user = getDemoUser();
  const tools = getToolsForRole(user.role);

  const grouped = tools.reduce<Record<string, typeof tools>>((acc, t) => {
    (acc[t.category] ||= []).push(t);
    return acc;
  }, {});
  const order: Array<'Student' | 'Staff' | 'HOD' | 'Admin'> = ['Student', 'Staff', 'HOD', 'Admin'];

  return (
    <div className="min-h-screen bg-surface-container">
      <DemoHeader onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex">
        <DemoSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} classes={MOCK_CLASSES} />
        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">
          <AiHeader title="AI Center" subtitle="All AI tools in one place" />

          {/* Evaluator entry for staff/hod */}
          {(user.role === 'staff' || user.role === 'hod') && (
            <button
              onClick={() => navigate('/ai/answer-evaluator')}
              className="w-full text-left mb-8 bg-gradient-to-r from-primary to-primary-hover text-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <ScanSearch className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="font-google-sans text-lg">AI Answer Evaluator</div>
                <div className="text-sm text-white/80">Compare student answers vs answer key with Gemini — staff reviews before saving</div>
              </div>
              <span className="hidden sm:inline text-sm bg-white/20 px-3 py-1 rounded-full">Open →</span>
            </button>
          )}

          {order.map((cat) => {
            const items = grouped[cat];
            if (!items?.length) return null;
            return (
              <section key={cat} className="mb-10">
                <h2 className="text-sm font-medium uppercase tracking-wider text-on-surface-variant mb-3">{cat} AI</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((t) => {
                    const Icon = (Icons as any)[t.icon] || Icons.Sparkles;
                    return (
                      <button
                        key={t.id}
                        onClick={() => navigate(`/ai/${t.id}`)}
                        className={cn(
                          'text-left bg-card border border-border rounded-2xl p-4 hover:shadow-md hover:border-primary/40 transition-all group'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-google-sans text-foreground text-[15px] leading-snug">{t.title}</div>
                            <div className="text-xs text-on-surface-variant mt-0.5">{t.description}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </main>
      </div>
    </div>
  );
};

export default AiCenter;
