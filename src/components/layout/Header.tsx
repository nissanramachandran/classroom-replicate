import React from 'react';
import { Menu, Plus, HelpCircle, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onMenuClick: () => void;
  onCreateClick: () => void;
  onJoinClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, onCreateClick, onJoinClick }) => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const isTeacher = profile?.role === 'teacher';

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="gc-header">
      {/* Left section */}
      <div className="flex items-center gap-1">
        <button
          onClick={onMenuClick}
          className="gc-btn-icon"
          aria-label="Main menu"
        >
          <Menu className="w-6 h-6 text-on-surface-variant" />
        </button>
        
        <div className="flex items-center gap-2 ml-2 cursor-pointer" onClick={() => navigate('/')}>
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
        {/* Create/Join button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="gc-btn-icon" aria-label="Create or join">
              <Plus className="w-6 h-6 text-on-surface-variant" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="gc-dropdown">
            {isTeacher && (
              <DropdownMenuItem onClick={onCreateClick} className="gc-dropdown-item">
                Create class
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onJoinClick} className="gc-dropdown-item">
              Join class
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Help */}
        <button className="gc-btn-icon hidden sm:flex" aria-label="Help">
          <HelpCircle className="w-6 h-6 text-on-surface-variant" />
        </button>

        {/* Profile menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-2" aria-label="Account menu">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.full_name || 'Profile'} 
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="gc-avatar gc-avatar-sm">
                  {getInitials(profile?.full_name)}
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="gc-dropdown w-64">
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-center gap-3">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.full_name || 'Profile'} 
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="gc-avatar">
                    {getInitials(profile?.full_name)}
                  </div>
                )}
                <div className="overflow-hidden">
                  <p className="font-medium text-sm text-foreground truncate">
                    {profile?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-on-surface-variant truncate">
                    {profile?.email}
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <span className="gc-chip gc-chip-primary">
                  {profile?.role === 'teacher' ? 'Teacher' : 'Student'}
                </span>
              </div>
            </div>
            <DropdownMenuItem className="gc-dropdown-item">
              <SettingsIcon className="w-5 h-5" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="gc-dropdown-item text-destructive">
              <LogOut className="w-5 h-5" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
