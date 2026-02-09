// Profile Page - Shows user profile with role badge, joined classes, and edit option
import React, { useState } from 'react';
import { User, Mail, Building2, BookOpen, Edit2, Camera, Shield, Calendar } from 'lucide-react';
import { getDemoUser, MOCK_CLASSES } from '@/data/mockData';
import DemoHeader from '@/components/layout/DemoHeader';
import DemoSidebar from '@/components/layout/DemoSidebar';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const ProfilePage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const profile = getDemoUser();
  const isTeacher = profile.role === 'teacher';

  // Profile display names based on role
  const displayName = isTeacher ? 'Tharani Vimal' : 'Nissan';
  const displayEmail = isTeacher ? 'tharani.vimal@university.edu' : 'nissan@student.edu';

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-surface-container transition-colors duration-300">
      <DemoHeader
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onCreateClick={() => {}}
        onJoinClick={() => {}}
      />
      <DemoSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} classes={MOCK_CLASSES} />

      <main className="pt-16 lg:pl-72 animate-fade-in">
        <div className="p-6 max-w-3xl mx-auto">
          {/* Profile Header Card */}
          <div className="gc-card overflow-hidden mb-6">
            {/* Banner */}
            <div className="h-32 bg-gradient-to-r from-primary to-gc-cyan relative">
              <button
                className="absolute bottom-3 right-3 p-2 bg-black/30 rounded-full hover:bg-black/50 transition-colors"
                onClick={() => toast.info('Banner change - demo only')}
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="px-6 pb-6">
              <div className="flex flex-col sm:flex-row items-start gap-4 -mt-12">
                {/* Avatar */}
                <div className="relative">
                  <div className={cn(
                    "w-24 h-24 rounded-full border-4 border-card flex items-center justify-center text-2xl font-bold text-white",
                    isTeacher ? 'bg-gc-green' : 'bg-primary'
                  )}>
                    {getInitials(displayName)}
                  </div>
                  <button
                    className="absolute bottom-0 right-0 p-1.5 bg-primary rounded-full text-white hover:bg-primary/90 transition-colors"
                    onClick={() => toast.info('Photo upload - demo only')}
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex-1 mt-4 sm:mt-14">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-google-sans text-foreground">{displayName}</h1>
                    <span className={cn(
                      "gc-chip font-semibold",
                      isTeacher ? "bg-gc-green/10 text-gc-green" : "gc-chip-primary"
                    )}>
                      <Shield className="w-3 h-3 mr-1" />
                      {isTeacher ? 'Staff' : 'Student'}
                    </span>
                  </div>
                  <p className="text-on-surface-variant mt-1">{displayEmail}</p>
                </div>

                <button
                  onClick={() => {
                    setIsEditing(!isEditing);
                    if (isEditing) toast.success('Profile updated (demo)');
                  }}
                  className={cn(
                    "gc-btn mt-4 sm:mt-14 px-4 py-2 rounded-lg",
                    isEditing ? "bg-primary text-white" : "bg-secondary text-secondary-foreground"
                  )}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  {isEditing ? 'Save Changes' : 'Edit Profile'}
                </button>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="gc-card p-6">
              <h2 className="font-google-sans text-lg text-foreground mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Personal Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">Full Name</label>
                  {isEditing ? (
                    <input className="gc-input mt-1" defaultValue={displayName} />
                  ) : (
                    <p className="text-foreground mt-1">{displayName}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">Email</label>
                  <p className="text-foreground mt-1 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-on-surface-variant" />
                    {displayEmail}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">Department</label>
                  <p className="text-foreground mt-1 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-on-surface-variant" />
                    {profile.department || 'IT'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">Role</label>
                  <p className="text-foreground mt-1 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-on-surface-variant" />
                    {isTeacher ? 'Staff / Teacher' : 'Student'}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="gc-card p-6">
              <h2 className="font-google-sans text-lg text-foreground mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Activity Overview
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-primary/5 text-center">
                  <p className="text-3xl font-bold text-primary">{MOCK_CLASSES.length}</p>
                  <p className="text-sm text-on-surface-variant mt-1">{isTeacher ? 'Classes Teaching' : 'Classes Enrolled'}</p>
                </div>
                <div className="p-4 rounded-lg bg-gc-green/5 text-center">
                  <p className="text-3xl font-bold text-gc-green">{isTeacher ? '42' : '28'}</p>
                  <p className="text-sm text-on-surface-variant mt-1">{isTeacher ? 'Students' : 'Assignments'}</p>
                </div>
                <div className="p-4 rounded-lg bg-gc-purple/5 text-center">
                  <p className="text-3xl font-bold text-gc-purple">{isTeacher ? '18' : '22'}</p>
                  <p className="text-sm text-on-surface-variant mt-1">{isTeacher ? 'Assignments Created' : 'Completed'}</p>
                </div>
                <div className="p-4 rounded-lg bg-gc-orange/5 text-center">
                  <p className="text-3xl font-bold text-gc-orange">
                    <Calendar className="w-5 h-5 inline mr-1" />
                    {isTeacher ? '3' : '6'}
                  </p>
                  <p className="text-sm text-on-surface-variant mt-1">{isTeacher ? 'Pending Reviews' : 'Pending Tasks'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Joined Classes */}
          <div className="gc-card p-6">
            <h2 className="font-google-sans text-lg text-foreground mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              {isTeacher ? 'Teaching Classes' : 'Enrolled Classes'}
            </h2>
            <div className="grid gap-3">
              {MOCK_CLASSES.map(cls => (
                <div key={cls.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-variant transition-colors">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: cls.banner_color }}
                  >
                    {cls.title.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{cls.title}</p>
                    <p className="text-sm text-on-surface-variant truncate">{cls.section} • {cls.subject}</p>
                  </div>
                  <span className="gc-chip text-xs">{cls.class_code}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
