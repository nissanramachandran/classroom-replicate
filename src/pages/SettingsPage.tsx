import React, { useState } from 'react';
import { 
  Settings, 
  Moon, 
  Sun, 
  Bell,
  Globe,
  Shield,
  User,
  Palette
} from 'lucide-react';
import { MOCK_USER, MOCK_CLASSES } from '@/data/mockData';
import DemoHeader from '@/components/layout/DemoHeader';
import DemoSidebar from '@/components/layout/DemoSidebar';
import { useTheme } from '@/contexts/ThemeContext';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const SettingsPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  
  const profile = MOCK_USER;

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

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
        <div className="p-6 max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Settings className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-google-sans text-foreground">Settings</h1>
          </div>

          {/* Profile section */}
          <div className="gc-card p-6 mb-6">
            <h2 className="text-lg font-google-sans text-foreground mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile
            </h2>
            <div className="flex items-center gap-4">
              <div className="gc-avatar w-16 h-16 text-xl bg-primary text-white">
                {getInitials(profile.full_name)}
              </div>
              <div>
                <p className="font-medium text-foreground text-lg">{profile.full_name}</p>
                <p className="text-on-surface-variant">{profile.email}</p>
                <div className="mt-2">
                  <span className="gc-chip gc-chip-primary">
                    {profile.role === 'teacher' ? 'Teacher' : 'Student'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="gc-card p-6 mb-6">
            <h2 className="text-lg font-google-sans text-foreground mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Appearance
            </h2>
            
            <div className="space-y-4">
              {/* Dark mode toggle */}
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? (
                    <Moon className="w-5 h-5 text-primary" />
                  ) : (
                    <Sun className="w-5 h-5 text-amber-500" />
                  )}
                  <div>
                    <p className="font-medium text-foreground">Dark mode</p>
                    <p className="text-sm text-on-surface-variant">
                      {theme === 'dark' ? 'Currently using dark theme' : 'Currently using light theme'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleTheme}
                  className={cn(
                    'relative w-14 h-8 rounded-full transition-all duration-300',
                    theme === 'dark' ? 'bg-primary' : 'bg-gray-300'
                  )}
                >
                  <div className={cn(
                    'absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 flex items-center justify-center',
                    theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
                  )}>
                    {theme === 'dark' ? (
                      <Moon className="w-4 h-4 text-primary" />
                    ) : (
                      <Sun className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="gc-card p-6 mb-6">
            <h2 className="text-lg font-google-sans text-foreground mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">Push notifications</p>
                  <p className="text-sm text-on-surface-variant">
                    Receive notifications for new assignments and announcements
                  </p>
                </div>
                <Switch 
                  checked={notifications} 
                  onCheckedChange={setNotifications}
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-foreground">Email updates</p>
                  <p className="text-sm text-on-surface-variant">
                    Receive email summaries of class activity
                  </p>
                </div>
                <Switch 
                  checked={emailUpdates} 
                  onCheckedChange={setEmailUpdates}
                />
              </div>
            </div>
          </div>

          {/* Language */}
          <div className="gc-card p-6 mb-6">
            <h2 className="text-lg font-google-sans text-foreground mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Language & Region
            </h2>
            
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-foreground">Language</p>
                <p className="text-sm text-on-surface-variant">
                  Choose your preferred language
                </p>
              </div>
              <select className="gc-input px-4 py-2 min-w-[150px]">
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>

          {/* Privacy */}
          <div className="gc-card p-6">
            <h2 className="text-lg font-google-sans text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacy & Security
            </h2>
            
            <div className="space-y-3">
              <button className="w-full text-left py-3 px-4 rounded-lg hover:bg-accent/50 transition-colors text-foreground">
                Manage data & privacy
              </button>
              <button className="w-full text-left py-3 px-4 rounded-lg hover:bg-accent/50 transition-colors text-foreground">
                Download your data
              </button>
              <button className="w-full text-left py-3 px-4 rounded-lg hover:bg-destructive/10 transition-colors text-destructive">
                Delete account
              </button>
            </div>
          </div>

          {/* Demo notice */}
          <div className="mt-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Demo Mode:</strong> Settings changes are simulated and will not persist after page refresh.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
