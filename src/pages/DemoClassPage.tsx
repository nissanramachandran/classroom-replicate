import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDemoUser, MOCK_CLASSES, MOCK_ASSIGNMENTS, MOCK_MATERIALS, MOCK_POSTS, MOCK_STUDENTS } from '@/data/mockData';
import DemoHeader from '@/components/layout/DemoHeader';
import DemoSidebar from '@/components/layout/DemoSidebar';
import DemoStreamTab from '@/components/class/DemoStreamTab';
import DemoClassworkTab from '@/components/class/DemoClassworkTab';
import DemoPeopleTab from '@/components/class/DemoPeopleTab';
import DemoGradesTab from '@/components/class/DemoGradesTab';
import AIDoubtSolver from '@/components/class/AIDoubtSolver';
import AIStaffTools from '@/components/class/AIStaffTools';
import ClassDiscussion from '@/components/class/ClassDiscussion';
import CreateClassModal from '@/components/modals/CreateClassModal';
import JoinClassModal from '@/components/modals/JoinClassModal';
import { ArrowLeft, Settings, MoreVertical, Eye, Sparkles, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type TabType = 'stream' | 'classwork' | 'people' | 'grades' | 'discussion';

const tabs: { id: TabType; label: string }[] = [
  { id: 'stream', label: 'Stream' },
  { id: 'classwork', label: 'Classwork' },
  { id: 'people', label: 'People' },
  { id: 'grades', label: 'Grades' },
  { id: 'discussion', label: 'Discussion' },
];

const DemoClassPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('stream');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [aiDoubtOpen, setAiDoubtOpen] = useState(false);
  const [aiToolsOpen, setAiToolsOpen] = useState(false);
  const [profile, setProfile] = useState(getDemoUser());

  // Update profile when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setProfile(getDemoUser());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const classData = MOCK_CLASSES.find(c => c.id === classId);
  const classAssignments = MOCK_ASSIGNMENTS.filter(a => a.class_id === classId);
  const classMaterials = MOCK_MATERIALS.filter(m => m.class_id === classId);
  const classPosts = MOCK_POSTS.filter(p => p.class_id === classId);
  
  const isTeacher = profile.role === 'teacher';

  if (!classData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-container">
        <div className="text-center">
          <h2 className="text-xl font-google-sans text-foreground mb-4">Class not found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="gc-btn-primary"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleCreateClass = async (data: any) => {
    if (!isTeacher) {
      toast.error('Only staff members can create classes');
      return;
    }
    toast.success('Class created!');
    setCreateModalOpen(false);
  };

  const handleJoinClass = async (code: string) => {
    toast.success('Successfully joined class!');
    setJoinModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-surface-container">
      <DemoHeader 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onCreateClick={() => isTeacher ? setCreateModalOpen(true) : toast.error('Only staff members can create classes')}
        onJoinClick={() => setJoinModalOpen(true)}
      />
      
      <DemoSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        classes={MOCK_CLASSES}
      />

      {/* Main content */}
      <main className="pt-16 lg:pl-72">
        {/* Class banner */}
        <div 
          className="relative h-48 sm:h-56 md:h-64"
          style={{ backgroundColor: classData.banner_color || '#1967d2' }}
        >
          {/* Back button */}
          <button
            onClick={() => navigate('/dashboard')}
            className="absolute top-4 left-4 p-2 rounded-full bg-black/20 hover:bg-black/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          {/* View only badge for students */}
          {!isTeacher && (
            <div className="absolute top-4 left-16 flex items-center gap-2 px-3 py-1.5 bg-black/30 backdrop-blur-sm rounded-full">
              <Eye className="w-4 h-4 text-white" />
              <span className="text-sm text-white font-medium">View Only Mode</span>
            </div>
          )}

          {/* Class info */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/50 to-transparent">
            <h1 className="text-2xl sm:text-3xl font-google-sans text-white mb-1">
              {classData.title}
            </h1>
            {classData.section && (
              <p className="text-white/90">{classData.section}</p>
            )}
          </div>

          {/* AI & Settings buttons */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {/* AI Doubt Solver button (students) */}
            {!isTeacher && (
              <button
                onClick={() => setAiDoubtOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-sm text-white font-medium hidden sm:inline">Ask AI Doubt</span>
              </button>
            )}

            {/* AI Staff Tools button (teachers) */}
            {isTeacher && (
              <button
                onClick={() => setAiToolsOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-sm text-white font-medium hidden sm:inline">AI Tools</span>
              </button>
            )}

            {isTeacher && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 rounded-full bg-black/20 hover:bg-black/30 transition-colors">
                    <MoreVertical className="w-5 h-5 text-white" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="gc-dropdown">
                  <DropdownMenuItem className="gc-dropdown-item">
                    <Settings className="w-4 h-4 mr-2" />
                    Class settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gc-dropdown-item">
                    Edit class
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border bg-card sticky top-16 z-30">
          <div className="max-w-5xl mx-auto px-4">
            <nav className="flex gap-1" role="tablist">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={cn(
                    "gc-tab",
                    activeTab === tab.id && "gc-tab-active"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab content */}
        <div className="p-4 sm:p-6">
          {activeTab === 'stream' && (
            <DemoStreamTab 
              classData={classData} 
              posts={classPosts}
              isTeacher={isTeacher}
            />
          )}
          {activeTab === 'classwork' && (
            <DemoClassworkTab 
              classId={classId!}
              assignments={classAssignments}
              materials={classMaterials}
              isTeacher={isTeacher}
            />
          )}
          {activeTab === 'people' && (
            <DemoPeopleTab 
              teacher={profile}
              students={MOCK_STUDENTS}
              isTeacher={isTeacher}
            />
          )}
          {activeTab === 'grades' && (
            <DemoGradesTab 
              assignments={classAssignments}
              students={MOCK_STUDENTS}
              isTeacher={isTeacher}
            />
          )}
          {activeTab === 'discussion' && (
            <div className="max-w-3xl mx-auto">
              <ClassDiscussion classId={classId!} isTeacher={isTeacher} />
            </div>
          )}
        </div>
      </main>

      {/* AI Modals */}
      <AIDoubtSolver
        isOpen={aiDoubtOpen}
        onClose={() => setAiDoubtOpen(false)}
        classTitle={classData.title}
        subject={classData.subject || 'General'}
      />
      <AIStaffTools
        isOpen={aiToolsOpen}
        onClose={() => setAiToolsOpen(false)}
        classTitle={classData.title}
        subject={classData.subject || 'General'}
      />

      {/* Modals - only create modal for teachers */}
      {isTeacher && (
        <CreateClassModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSubmit={handleCreateClass}
          loading={false}
        />
      )}
      
      <JoinClassModal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        onSubmit={handleJoinClass}
        loading={false}
      />
    </div>
  );
};

export default DemoClassPage;
