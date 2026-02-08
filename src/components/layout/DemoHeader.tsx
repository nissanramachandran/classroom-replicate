import React from 'react';
import { Menu, Plus, HelpCircle, Settings as SettingsIcon, LogOut, Moon, Sun, RefreshCw } from 'lucide-react';
import { getDemoUser, setDemoUserRole } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DemoHeaderProps {
  onMenuClick: () => void;
  onCreateClick: () => void;
  onJoinClick: () => void;
}

const DemoHeader: React.FC<DemoHeaderProps> = ({ onMenuClick, onCreateClick, onJoinClick }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [profile, setProfile] = React.useState(getDemoUser());
  const isTeacher = profile.role === 'teacher';

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleRoleSwitch = () => {
    const newRole = profile.role === 'teacher' ? 'student' : 'teacher';
    setDemoUserRole(newRole as 'teacher' | 'student', profile.department);
    setProfile(getDemoUser());
    toast.success(`Switched to ${newRole === 'teacher' ? 'Staff' : 'Student'} view`);
    // Force refresh to update all components
    window.location.reload();
  };

  return (
    <header className="gc-header transition-colors duration-300">
      {/* Left section */}
      <div className="flex items-center gap-1">
        <button
          onClick={onMenuClick}
          className="gc-btn-icon"
          aria-label="Main menu"
        >
          <Menu className="w-6 h-6 text-on-surface-variant" />
        </button>
        
        <div className="flex items-center gap-2 ml-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none">
            <rect width="24" height="24" rx="4" fill="#1967d2"/>
            <path d="M12 12c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm0 1.5c-2 0-6 1-6 3v1.5h12v-1.5c0-2-4-3-6-3z" fill="white"/>
          </svg>
          <span className="text-[22px] font-google-sans text-on-surface-variant hidden sm:block">
            Classroom
          </span>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1 ml-auto">
        {/* Create/Join button - only show create for teachers */}
        {isTeacher ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="gc-btn-icon" aria-label="Create or join">
                <Plus className="w-6 h-6 text-on-surface-variant" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="gc-dropdown">
              <DropdownMenuItem onClick={onCreateClick} className="gc-dropdown-item">
                Create class
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onJoinClick} className="gc-dropdown-item">
                Join class
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <button className="gc-btn-icon" aria-label="Join class" onClick={onJoinClick}>
            <Plus className="w-6 h-6 text-on-surface-variant" />
          </button>
        )}

        {/* Theme toggle */}
        <button 
          onClick={toggleTheme}
          className="gc-btn-icon hidden sm:flex" 
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-6 h-6 text-amber-500" />
          ) : (
            <Moon className="w-6 h-6 text-on-surface-variant" />
          )}
        </button>

        {/* Help */}
        <button className="gc-btn-icon hidden sm:flex" aria-label="Help">
          <HelpCircle className="w-6 h-6 text-on-surface-variant" />
        </button>

        {/* Profile menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-2" aria-label="Account menu">
              <div className={`gc-avatar gc-avatar-sm ${isTeacher ? 'bg-gc-green' : 'bg-primary'} text-white`}>
                {getInitials(profile.full_name)}
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="gc-dropdown w-64">
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className={`gc-avatar ${isTeacher ? 'bg-gc-green' : 'bg-primary'} text-white`}>
                  {getInitials(profile.full_name)}
                </div>
                <div className="overflow-hidden">
                  <p className="font-medium text-sm text-foreground truncate">
                    {profile.full_name || 'User'}
                  </p>
                  <p className="text-xs text-on-surface-variant truncate">
                    {profile.email}
                  </p>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className={`gc-chip ${isTeacher ? 'bg-gc-green/10 text-gc-green' : 'gc-chip-primary'}`}>
                  {isTeacher ? 'Staff' : 'Student'}
                </span>
                <span className="gc-chip bg-muted text-muted-foreground">
                  {profile.department}
                </span>
                <span className="gc-chip bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                  Demo Mode
                </span>
              </div>
            </div>
            <DropdownMenuItem onClick={handleRoleSwitch} className="gc-dropdown-item">
              <RefreshCw className="w-5 h-5" />
              Switch to {isTeacher ? 'Student' : 'Staff'} View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')} className="gc-dropdown-item">
              <SettingsIcon className="w-5 h-5" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/')} className="gc-dropdown-item text-destructive">
              <LogOut className="w-5 h-5" />
              Exit Demo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DemoHeader;
