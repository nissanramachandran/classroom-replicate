// Dynamic AI tool page — renders any tool by slug via config
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import DemoSidebar from '@/components/layout/DemoSidebar';
import DemoHeader from '@/components/layout/DemoHeader';
import { getDemoUser, MOCK_CLASSES } from '@/data/mockData';
import { getToolById, getToolsForRole } from '@/lib/aiTools';
import AiHeader from '@/components/ai/AiHeader';
import AiToolRunner from '@/components/ai/AiToolRunner';

const AiToolPage: React.FC = () => {
  const { toolId } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const user = getDemoUser();
  const tool = toolId ? getToolById(toolId) : undefined;
  const allowed = tool ? (tool.role === 'all' || (user.role && tool.role.includes(user.role))) : false;

  return (
    <div className="min-h-screen bg-surface-container">
      <DemoHeader onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex">
        <DemoSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} classes={MOCK_CLASSES} />
        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">
          <button
            onClick={() => navigate('/ai')}
            className="flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> AI Center
          </button>

          {!tool || !allowed ? (
            <div className="bg-card border border-border rounded-2xl p-10 text-center">
              <p className="text-foreground font-medium">
                {!tool ? 'Tool not found' : 'This tool is not available for your role'}
              </p>
              <button onClick={() => navigate('/ai')} className="mt-4 text-primary text-sm">
                Back to AI Center
              </button>
            </div>
          ) : (
            <>
              <AiHeader title={tool.title} subtitle={tool.description} />
              <AiToolRunner tool={tool} />
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AiToolPage;
