import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_USER, MOCK_CLASSES } from '@/data/mockData';
import DemoHeader from '@/components/layout/DemoHeader';
import DemoSidebar from '@/components/layout/DemoSidebar';
import DemoClassCard from '@/components/class/DemoClassCard';
import DemoCreateClassModal from '@/components/modals/DemoCreateClassModal';
import JoinClassModal from '@/components/modals/JoinClassModal';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

interface DemoClass {
  id: string;
  title: string;
  section: string;
  subject: string;
  room: string;
  banner_color: string;
  class_code: string;
  owner_id: string;
  description: string;
  created_at: string;
  updated_at: string;
  owner: typeof MOCK_USER;
}

const DemoDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<DemoClass[]>(MOCK_CLASSES);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);

  const profile = MOCK_USER;
  const isTeacher = profile.role === 'teacher';

  const handleCreateClass = (data: {
    title: string;
    section?: string;
    subject?: string;
    room?: string;
    banner_color: string;
  }) => {
    const newClass: DemoClass = {
      id: `class-${Date.now()}`,
      title: data.title,
      section: data.section || '',
      subject: data.subject || '',
      room: data.room || '',
      banner_color: data.banner_color,
      class_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      owner_id: MOCK_USER.id,
      description: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      owner: MOCK_USER,
    };
    
    setClasses(prev => [...prev, newClass]);
    toast.success('Class created!');
    setCreateModalOpen(false);
  };

  const handleJoinClass = async (code: string) => {
    // Simulate joining a class
    toast.success('Successfully joined class!');
    setJoinModalOpen(false);
  };

  const handleDeleteClass = (classId: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return;
    setClasses(prev => prev.filter(c => c.id !== classId));
    toast.success('Class deleted');
  };

  return (
    <div className="min-h-screen bg-surface-container">
      <DemoHeader 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onCreateClick={() => setCreateModalOpen(true)}
        onJoinClick={() => setJoinModalOpen(true)}
      />
      
      <DemoSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        classes={classes}
      />

      {/* Main content */}
      <main className="pt-16 lg:pl-72">
        <div className="p-6">
          {classes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-48 h-48 mb-6 opacity-50">
                <svg viewBox="0 0 24 24" className="w-full h-full text-on-surface-variant" fill="currentColor">
                  <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
                </svg>
              </div>
              <h2 className="text-xl font-google-sans text-foreground mb-2">
                {isTeacher ? 'No classes yet' : 'No enrolled classes'}
              </h2>
              <p className="text-on-surface-variant mb-6">
                {isTeacher 
                  ? 'Create your first class to get started' 
                  : 'Join a class using a class code from your teacher'}
              </p>
              <button
                onClick={() => isTeacher ? setCreateModalOpen(true) : setJoinModalOpen(true)}
                className="gc-btn-primary px-6 py-3"
              >
                <Plus className="w-5 h-5 mr-2" />
                {isTeacher ? 'Create class' : 'Join class'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {classes.map((cls) => (
                <DemoClassCard
                  key={cls.id}
                  classData={cls}
                  onClick={() => navigate(`/demo/class/${cls.id}`)}
                  onEdit={() => {/* TODO: Edit modal */}}
                  onDelete={() => handleDeleteClass(cls.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button for mobile */}
      <button
        onClick={() => isTeacher ? setCreateModalOpen(true) : setJoinModalOpen(true)}
        className="gc-fab fixed bottom-6 right-6 lg:hidden"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modals */}
      <DemoCreateClassModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateClass}
      />
      
      <JoinClassModal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        onSubmit={handleJoinClass}
        loading={false}
      />
    </div>
  );
};

export default DemoDashboard;
