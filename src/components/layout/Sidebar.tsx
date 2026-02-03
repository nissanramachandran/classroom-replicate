import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, CheckSquare, Settings, Archive, X } from 'lucide-react';
import { useClassroom } from '@/contexts/ClassroomContext';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { classes } = useClassroom();

  const menuItems = [
    { icon: Home, label: 'Classes', path: '/' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
    { icon: CheckSquare, label: 'To-do', path: '/todo' },
    { icon: Archive, label: 'Archived classes', path: '/archived' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full w-72 bg-sidebar z-50 transform transition-transform duration-200 ease-in-out',
          'lg:top-16 lg:h-[calc(100vh-4rem)] lg:transform-none lg:z-30',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Mobile close button */}
        <div className="flex items-center justify-between p-4 lg:hidden border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none">
              <rect width="24" height="24" rx="4" fill="#1967d2"/>
              <path d="M12 12c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm0 1.5c-2 0-6 1-6 3v1.5h12v-1.5c0-2-4-3-6-3z" fill="white"/>
            </svg>
            <span className="text-xl font-google-sans text-foreground">Classroom</span>
          </div>
          <button onClick={onClose} className="gc-btn-icon">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="py-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={cn(
                  'gc-sidebar-item w-full',
                  isActive && 'active'
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="mx-6 my-2 border-t border-sidebar-border" />

        {/* Enrolled classes */}
        <div className="py-2">
          <h3 className="px-6 py-2 text-xs font-medium text-on-surface-variant uppercase tracking-wider">
            Enrolled
          </h3>
          {classes.length === 0 ? (
            <p className="px-6 py-3 text-sm text-on-surface-variant">
              No classes yet
            </p>
          ) : (
            classes.slice(0, 5).map((cls) => (
              <button
                key={cls.id}
                onClick={() => handleNavigate(`/class/${cls.id}`)}
                className="gc-sidebar-item w-full"
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0"
                  style={{ backgroundColor: cls.banner_color }}
                >
                  {cls.title[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium truncate">{cls.title}</p>
                  {cls.section && (
                    <p className="text-xs text-on-surface-variant truncate">{cls.section}</p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
