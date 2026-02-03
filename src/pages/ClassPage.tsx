import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useClassroom } from '@/contexts/ClassroomContext';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import StreamTab from '@/components/class/StreamTab';
import ClassworkTab from '@/components/class/ClassworkTab';
import PeopleTab from '@/components/class/PeopleTab';
import GradesTab from '@/components/class/GradesTab';
import CreateClassModal from '@/components/modals/CreateClassModal';
import JoinClassModal from '@/components/modals/JoinClassModal';
import { toast } from 'sonner';
import { Loader2, Settings, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type TabType = 'stream' | 'classwork' | 'people' | 'grades';

const ClassPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { 
    classes, 
    currentClass, 
    setCurrentClass,
    fetchClasses,
    createClass,
    joinClass,
    fetchPosts,
    fetchAssignments,
    fetchMaterials,
    fetchMembers,
    isTeacher: checkIsTeacher,
  } = useClassroom();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('stream');
  const [loading, setLoading] = useState(true);

  // Load class data
  useEffect(() => {
    const loadClassData = async () => {
      if (!classId || !user) return;
      
      setLoading(true);
      
      // If classes not loaded yet, fetch them
      if (classes.length === 0) {
        await fetchClasses();
      }
      
      setLoading(false);
    };

    loadClassData();
  }, [classId, user, fetchClasses, classes.length]);

  // Set current class when classes are loaded
  useEffect(() => {
    if (classId && classes.length > 0) {
      const foundClass = classes.find(c => c.id === classId);
      if (foundClass) {
        setCurrentClass(foundClass);
        // Fetch class data
        fetchPosts(classId);
        fetchAssignments(classId);
        fetchMaterials(classId);
        fetchMembers(classId);
      } else {
        navigate('/');
        toast.error('Class not found');
      }
    }
  }, [classId, classes, setCurrentClass, fetchPosts, fetchAssignments, fetchMaterials, fetchMembers, navigate]);

  const handleCreateClass = async (data: {
    title: string;
    section?: string;
    subject?: string;
    room?: string;
    banner_color: string;
  }) => {
    setActionLoading(true);
    const { error } = await createClass(data);
    setActionLoading(false);
    
    if (error) {
      toast.error('Failed to create class');
    } else {
      toast.success('Class created!');
      setCreateModalOpen(false);
    }
  };

  const handleJoinClass = async (code: string) => {
    setActionLoading(true);
    const { error } = await joinClass(code);
    setActionLoading(false);
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Successfully joined class!');
      setJoinModalOpen(false);
    }
  };

  if (loading || !currentClass) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-container">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isTeacher = checkIsTeacher(currentClass.id);
  const tabs: { id: TabType; label: string }[] = [
    { id: 'stream', label: 'Stream' },
    { id: 'classwork', label: 'Classwork' },
    { id: 'people', label: 'People' },
    { id: 'grades', label: 'Grades' },
  ];

  return (
    <div className="min-h-screen bg-surface-container">
      <Header 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onCreateClick={() => setCreateModalOpen(true)}
        onJoinClick={() => setJoinModalOpen(true)}
      />
      
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <main className="pt-16 lg:pl-72">
        {/* Class banner */}
        <div 
          className="relative h-60 flex flex-col justify-end p-6"
          style={{ backgroundColor: currentClass.banner_color }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          
          <div className="relative z-10">
            <h1 className="text-3xl font-google-sans text-white font-medium mb-1">
              {currentClass.title}
            </h1>
            {currentClass.section && (
              <p className="text-white/80 text-lg">{currentClass.section}</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            {isTeacher && (
              <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            )}
            <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border bg-card">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn('gc-tab', activeTab === tab.id && 'active')}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="p-6">
          {activeTab === 'stream' && (
            <StreamTab classId={currentClass.id} isTeacher={isTeacher} />
          )}
          {activeTab === 'classwork' && (
            <ClassworkTab classId={currentClass.id} isTeacher={isTeacher} />
          )}
          {activeTab === 'people' && (
            <PeopleTab classId={currentClass.id} isTeacher={isTeacher} ownerId={currentClass.owner_id} />
          )}
          {activeTab === 'grades' && (
            <GradesTab classId={currentClass.id} isTeacher={isTeacher} />
          )}
        </div>
      </main>

      {/* Modals */}
      <CreateClassModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateClass}
        loading={actionLoading}
      />
      
      <JoinClassModal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        onSubmit={handleJoinClass}
        loading={actionLoading}
      />
    </div>
  );
};

export default ClassPage;
