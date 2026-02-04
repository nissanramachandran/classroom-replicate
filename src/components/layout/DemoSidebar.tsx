import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, ClipboardList, Settings, Archive, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DemoSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  classes: any[];
}

const DemoSidebar: React.FC<DemoSidebarProps> = ({ isOpen, onClose, classes }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Classes', path: '/dashboard' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
    { icon: ClipboardList, label: 'To-do', path: '/todo' },
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: Archive, label: 'Archived classes', path: '/archived' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "gc-sidebar",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="gc-btn-icon absolute right-2 top-4 lg:hidden"
        >
          <X className="w-5 h-5 text-on-surface-variant" />
        </button>

        {/* Navigation items */}
        <nav className="mt-4 px-3">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                onClose();
              }}
              className={cn(
                "gc-sidebar-item",
                isActive(item.path) && "gc-sidebar-item-active"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Divider */}
        <div className="h-px bg-border mx-3 my-4" />

        {/* Enrolled/Teaching label */}
        <div className="px-6 py-2">
          <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
            Teaching
          </p>
        </div>

        {/* Class list */}
        <nav className="px-3">
          {classes.slice(0, 5).map((cls) => (
            <button
              key={cls.id}
              onClick={() => {
                navigate(`/demo/class/${cls.id}`);
                onClose();
              }}
              className={cn(
                "gc-sidebar-item",
                location.pathname === `/demo/class/${cls.id}` && "gc-sidebar-item-active"
              )}
            >
              <div 
                className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white text-sm font-medium"
                style={{ backgroundColor: cls.banner_color || '#1967d2' }}
              >
                {cls.title.charAt(0)}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-medium truncate text-sm">{cls.title}</p>
                {cls.section && (
                  <p className="text-xs text-on-surface-variant truncate">{cls.section}</p>
                )}
              </div>
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default DemoSidebar;
