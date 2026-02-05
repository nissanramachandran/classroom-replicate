import React, { useState } from 'react';
import { Archive, Inbox } from 'lucide-react';
import { MOCK_CLASSES } from '@/data/mockData';
import DemoHeader from '@/components/layout/DemoHeader';
import DemoSidebar from '@/components/layout/DemoSidebar';

const ArchivedPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-container transition-colors duration-300">
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

      <main className="pt-16 lg:pl-72 animate-fade-in">
        <div className="p-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Archive className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-google-sans text-foreground">Archived classes</h1>
          </div>

          {/* Empty state */}
          <div className="gc-card p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-surface-container-high flex items-center justify-center">
              <Inbox className="w-12 h-12 text-on-surface-variant/50" />
            </div>
            <h2 className="text-xl font-google-sans text-foreground mb-2">
              No archived classes
            </h2>
            <p className="text-on-surface-variant max-w-md mx-auto">
              When you archive a class, it will appear here. Archived classes are read-only and can be restored at any time.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ArchivedPage;
