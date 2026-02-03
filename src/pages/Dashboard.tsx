import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useClassroom } from '@/contexts/ClassroomContext';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import ClassCard from '@/components/class/ClassCard';
import CreateClassModal from '@/components/modals/CreateClassModal';
import JoinClassModal from '@/components/modals/JoinClassModal';
import { toast } from 'sonner';
import { Loader2, Plus } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { classes, loading: classLoading, fetchClasses, createClass, joinClass, deleteClass } = useClassroom();
  const navigate = useNavigate();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user && profile?.role) {
      fetchClasses();
    }
  }, [user, profile?.role, fetchClasses]);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [authLoading, user, navigate]);

  // Redirect to role selection if no role set
  useEffect(() => {
    if (!authLoading && user && profile && !profile.role) {
      navigate('/select-role');
    }
  }, [authLoading, user, profile, navigate]);

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

  const handleDeleteClass = async (classId: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return;
    
    const { error } = await deleteClass(classId);
    if (error) {
      toast.error('Failed to delete class');
    } else {
      toast.success('Class deleted');
    }
  };

  if (authLoading || (user && !profile)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-container">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isTeacher = profile?.role === 'teacher';

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
        <div className="p-6">
          {classLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : classes.length === 0 ? (
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
                <ClassCard
                  key={cls.id}
                  classData={cls}
                  onClick={() => navigate(`/class/${cls.id}`)}
                  onEdit={() => {/* TODO: Edit modal */}}
                  onDelete={() => handleDeleteClass(cls.id)}
                />
              ))}
            </div>
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

export default Dashboard;
